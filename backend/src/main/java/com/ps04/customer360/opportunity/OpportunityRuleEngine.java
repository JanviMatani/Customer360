package com.ps04.customer360.opportunity;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.config_rules.ConfigService;
import com.ps04.customer360.customer360.Customer360Service;
import com.ps04.customer360.customer360.Customer360Service.Customer360Response;
import com.ps04.customer360.customer360.Customer360Service.ProductSummary;
import com.ps04.customer360.golden.GoldenCustomerRepo;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.opportunity.model.Opportunity;
import com.ps04.customer360.opportunity.model.OpportunityRule;
import com.ps04.customer360.opportunity.model.OpportunityRule.RuleCondition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class OpportunityRuleEngine {

    private static final Logger log = LoggerFactory.getLogger(OpportunityRuleEngine.class);

    private final GoldenCustomerRepo goldenCustomerRepo;
    private final Customer360Service customer360Service;
    private final OpportunityRepo opportunityRepo;
    private final ConfigService configService;
    private final OpportunityScoringService scoringService;
    private final AuditService auditService;

    public OpportunityRuleEngine(GoldenCustomerRepo goldenCustomerRepo,
                                 Customer360Service customer360Service,
                                 OpportunityRepo opportunityRepo,
                                 ConfigService configService,
                                 OpportunityScoringService scoringService,
                                 AuditService auditService) {
        this.goldenCustomerRepo = goldenCustomerRepo;
        this.customer360Service = customer360Service;
        this.opportunityRepo = opportunityRepo;
        this.configService = configService;
        this.scoringService = scoringService;
        this.auditService = auditService;
    }

    /**
     * Evaluates all active opportunity rules for a given Golden Customer.
     */
    public List<Opportunity> evaluateOpportunitiesForCustomer(String goldenId) {
        GoldenCustomer customer = goldenCustomerRepo.findById(goldenId).orElse(null);
        if (customer == null) return List.of();

        Customer360Response c360 = customer360Service.getCustomer360(goldenId, false);
        CustomerFactSheet factSheet = buildFactSheet(c360);

        List<OpportunityRule> rules = configService.getOpportunityRules();
        List<Opportunity> results = new ArrayList<>();

        for (OpportunityRule rule : rules) {
            EvaluationResult eval = evaluateRule(rule, factSheet);

            Optional<Opportunity> existingOpt = opportunityRepo.findByGoldenIdAndRuleId(goldenId, rule.getId());

            if (eval.allMet()) {
                Double potentialVal = calculatePotentialValue(rule, factSheet);
                int score = scoringService.computeScore(potentialVal, c360.getTotalRelationshipValue());

                Opportunity opp = existingOpt.orElse(Opportunity.builder()
                        .goldenId(goldenId)
                        .ruleId(rule.getId())
                        .status("new")
                        .generatedAt(Instant.now())
                        .build());

                opp.setCustomerName(customer.getName());
                opp.setRmId(customer.getRmId());
                opp.setProduct(rule.getProduct());
                opp.setScore(score);
                opp.setPotentialValue(potentialVal);
                opp.setReasons(eval.reasons());
                opp.setUpdatedAt(Instant.now());
                if ("dismissed".equalsIgnoreCase(opp.getStatus())) {
                    opp.setStatus("new"); // Re-activate if previously dismissed but now qualifies
                    opp.setDismissedReason(null);
                }

                opportunityRepo.save(opp);
                results.add(opp);
            } else if (existingOpt.isPresent()) {
                Opportunity opp = existingOpt.get();
                if (!"dismissed".equals(opp.getStatus())) {
                    opp.setStatus("dismissed");
                    opp.setDismissedReason("rule no longer satisfied");
                    opp.setUpdatedAt(Instant.now());
                    opportunityRepo.save(opp);

                    auditService.log("system", "system", "OPPORTUNITY_DISMISSED",
                            "opportunity", opp.getId(),
                            "Opportunity " + opp.getId() + " dismissed: rule no longer satisfied after rule/threshold change");
                }
            }
        }

        return results;
    }

    /**
     * Recomputes opportunities across all Golden Customers (used by live config-change demo).
     */
    public int recomputeAllOpportunities() {
        List<GoldenCustomer> customers = goldenCustomerRepo.findAll();
        int count = 0;
        for (GoldenCustomer g : customers) {
            List<Opportunity> opps = evaluateOpportunitiesForCustomer(g.getId());
            count += opps.size();
        }
        return count;
    }

    // ─── Fact Sheet & Rule Evaluation Core ─────────────────────────────────

    private record CustomerFactSheet(
            Map<String, ProductFact> products,
            Double totalRelationshipValue,
            String segment
    ) {}

    private record ProductFact(
            boolean exists,
            Double value,
            String status
    ) {}

    private record EvaluationResult(
            boolean allMet,
            List<Opportunity.ReasonItem> reasons
    ) {}

    private CustomerFactSheet buildFactSheet(Customer360Response c360) {
        Map<String, ProductFact> map = new HashMap<>();
        if (c360.getProducts() != null) {
            for (ProductSummary p : c360.getProducts()) {
                map.put(p.getProduct().toLowerCase(), new ProductFact(
                        p.isExists(),
                        p.getRelationshipValue() != null ? p.getRelationshipValue() : 0.0,
                        p.getStatus() != null ? p.getStatus() : "None"
                ));
            }
        }
        return new CustomerFactSheet(map, c360.getTotalRelationshipValue(), c360.getSegment());
    }

    private EvaluationResult evaluateRule(OpportunityRule rule, CustomerFactSheet sheet) {
        List<Opportunity.ReasonItem> reasons = new ArrayList<>();
        boolean allMet = true;

        for (RuleCondition cond : rule.getConditions()) {
            boolean met = checkCondition(cond, sheet, reasons);
            if (!met) allMet = false;
        }

        return new EvaluationResult(allMet, reasons);
    }

    private boolean checkCondition(RuleCondition cond, CustomerFactSheet sheet, List<Opportunity.ReasonItem> reasons) {
        String field = cond.getField();
        String op = cond.getOp();
        Object targetVal = cond.getValue();

        String[] parts = field.split("\\.");
        String prodKey = parts[0].toLowerCase();
        String prop = parts.length > 1 ? parts[1] : "";

        ProductFact pf = sheet.products.getOrDefault(prodKey, new ProductFact(false, 0.0, "None"));

        boolean result = false;
        String displayVal = "";
        String label = formatConditionLabel(prodKey, prop, op, targetVal);

        if ("exists".equalsIgnoreCase(prop)) {
            boolean expected = Boolean.parseBoolean(targetVal.toString());
            result = (pf.exists == expected);
            displayVal = pf.exists ? "Present" : "Absent";
        } else if ("relationshipValue".equalsIgnoreCase(prop) || "aum".equalsIgnoreCase(prop)) {
            double actual = pf.value;
            double target = Double.parseDouble(targetVal.toString());
            result = compareNumeric(actual, op, target);
            displayVal = "₹" + String.format("%.1fL", actual / 100000.0);
        } else if ("policyStatus".equalsIgnoreCase(prop) || "status".equalsIgnoreCase(prop)) {
            String expected = targetVal.toString();
            result = expected.equalsIgnoreCase(pf.status);
            displayVal = pf.status;
        }

        reasons.add(Opportunity.ReasonItem.builder()
                .label(label)
                .value(displayVal)
                .met(result)
                .build());

        return result;
    }

    private boolean compareNumeric(double actual, String op, double target) {
        return switch (op) {
            case ">" -> actual > target;
            case ">=" -> actual >= target;
            case "<" -> actual < target;
            case "<=" -> actual <= target;
            case "=" -> Math.abs(actual - target) < 0.01;
            default -> false;
        };
    }

    private String formatConditionLabel(String prod, String prop, String op, Object val) {
        if ("exists".equalsIgnoreCase(prop)) {
            return Boolean.parseBoolean(val.toString()) ? prod.toUpperCase() + " exists" : "No existing " + prod;
        }
        if ("relationshipValue".equalsIgnoreCase(prop)) {
            double v = Double.parseDouble(val.toString()) / 100000.0;
            return prod.toUpperCase() + " relationship " + op + " ₹" + String.format("%.0fL", v);
        }
        if ("policyStatus".equalsIgnoreCase(prop)) {
            return prod.toUpperCase() + " policy status = " + val;
        }
        return prod + " " + prop + " " + op + " " + val;
    }

    private Double calculatePotentialValue(OpportunityRule rule, CustomerFactSheet sheet) {
        double total = sheet.totalRelationshipValue != null ? sheet.totalRelationshipValue : 500000.0;
        return total * 0.20; // Default estimated potential is 20% of relationship value
    }
}
