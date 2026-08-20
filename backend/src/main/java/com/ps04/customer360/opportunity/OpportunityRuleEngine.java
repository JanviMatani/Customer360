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
    private final ContactTimingService contactTimingService;
    private final AiSummaryService aiSummaryService;

    public OpportunityRuleEngine(GoldenCustomerRepo goldenCustomerRepo,
                                 Customer360Service customer360Service,
                                 OpportunityRepo opportunityRepo,
                                 ConfigService configService,
                                 OpportunityScoringService scoringService,
                                 AuditService auditService,
                                 ContactTimingService contactTimingService,
                                 AiSummaryService aiSummaryService) {
        this.goldenCustomerRepo = goldenCustomerRepo;
        this.customer360Service = customer360Service;
        this.opportunityRepo = opportunityRepo;
        this.configService = configService;
        this.scoringService = scoringService;
        this.auditService = auditService;
        this.contactTimingService = contactTimingService;
        this.aiSummaryService = aiSummaryService;
    }

    /**
     * Evaluates all active opportunity rules for a given Golden Customer.
     */
    public List<Opportunity> evaluateOpportunitiesForCustomer(String goldenId) {
        GoldenCustomer customer = goldenCustomerRepo.findById(goldenId).orElse(null);
        if (customer == null) return List.of();

        Customer360Response c360 = customer360Service.getCustomer360(goldenId, false);
        CustomerFactSheet factSheet = buildFactSheet(c360);
        String currentHash = generateFactSheetHash(factSheet);

        // Calculate dynamic recency & engagement
        double recency = calculateRecency(c360);
        double engagement = calculateEngagement(c360);

        List<OpportunityRule> rules = configService.getOpportunityRules();
        List<Opportunity> results = new ArrayList<>();

        for (OpportunityRule rule : rules) {
            Optional<Opportunity> existingOpt = opportunityRepo.findByGoldenIdAndRuleId(goldenId, rule.getId());
            
            // Feature 3 - Staleness Check
            if (existingOpt.isPresent()) {
                Opportunity existing = existingOpt.get();
                boolean isStale = existing.getLastScoredAt() == null || 
                                  existing.getLastScoredAt().isBefore(Instant.now().minus(java.time.Duration.ofDays(7)));
                boolean hashChanged = !Objects.equals(existing.getFactSheetHash(), currentHash);
                
                if (!isStale && !hashChanged && !"dismissed".equals(existing.getStatus()) && !"incomplete_data".equals(existing.getStatus())) {
                    results.add(existing);
                    continue; // Skip full re-evaluation
                }
            }

            EvaluationResult eval = evaluateRule(rule, factSheet);

            if (eval.allMet() || !eval.missingFields().isEmpty()) {
                Double potentialVal = calculatePotentialValue(rule, factSheet);
                int score = scoringService.computeScore(potentialVal, c360.getTotalRelationshipValue(), recency, engagement);

                Opportunity opp = existingOpt.orElse(Opportunity.builder()
                        .goldenId(goldenId)
                        .ruleId(rule.getId())
                        .status("new")
                        .generatedAt(Instant.now())
                        .build());

                opp.setCustomerName(customer.getName());
                opp.setRmId(customer.getRmId());
                opp.setProduct(rule.getProduct());
                opp.setCategory(rule.getCategory());
                opp.setScore(score);
                opp.setPotentialValue(potentialVal);
                opp.setReasons(eval.reasons());
                opp.setUpdatedAt(Instant.now());
                opp.setLastScoredAt(Instant.now());
                opp.setFactSheetHash(currentHash);

                // Feature 4 - Missing Data
                if (!eval.missingFields().isEmpty()) {
                    opp.setStatus("incomplete_data");
                    opp.setDataCompleteness("INCOMPLETE");
                    opp.setMissingFields(eval.missingFields());
                } else {
                    opp.setDataCompleteness("COMPLETE");
                    opp.setMissingFields(List.of());
                    if ("dismissed".equalsIgnoreCase(opp.getStatus()) || "incomplete_data".equalsIgnoreCase(opp.getStatus())) {
                        opp.setStatus("new"); // Re-activate
                        opp.setDismissedReason(null);
                    }
                }

                // Feature 6 - Contact Timing
                ContactTimingService.ContactTiming timing = contactTimingService.determineTiming(c360, rule, !eval.missingFields().isEmpty());
                opp.setContactWindow(timing.window());
                opp.setSuggestedContactBy(timing.suggestedDate());
                opp.setContactReason(timing.reason());

                // Feature 7 - AI Summary
                opp.setAiSummary(aiSummaryService.generateSummary(c360, opp));

                opp.setSuppressed(false);
                opp.setSuppressedByOppId(null);
                opp.setBundleSummary(null);

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

        // Feature 5 - Bundling by Category
        bundleOpportunities(results);

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
            List<Opportunity.ReasonItem> reasons,
            List<String> missingFields
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
        List<String> missingFields = new ArrayList<>();
        boolean allMet = true;

        for (RuleCondition cond : rule.getConditions()) {
            ConditionCheckResult res = checkCondition(cond, sheet, reasons);
            if (res.isMissing()) {
                missingFields.add(cond.getField());
                allMet = false;
            } else if (!res.isMet()) {
                allMet = false;
            }
        }

        return new EvaluationResult(allMet, reasons, missingFields);
    }

    private record ConditionCheckResult(boolean isMet, boolean isMissing) {}

    private ConditionCheckResult checkCondition(RuleCondition cond, CustomerFactSheet sheet, List<Opportunity.ReasonItem> reasons) {
        String field = cond.getField();
        String op = cond.getOp();
        Object targetVal = cond.getValue();

        String[] parts = field.split("\\.");
        String prodKey = parts[0].toLowerCase();
        String prop = parts.length > 1 ? parts[1] : "";

        ProductFact pf = sheet.products.getOrDefault(prodKey, new ProductFact(false, null, "None"));

        boolean result = false;
        boolean missing = false;
        String displayVal = "";
        String label = formatConditionLabel(prodKey, prop, op, targetVal);

        if ("exists".equalsIgnoreCase(prop)) {
            boolean expected = Boolean.parseBoolean(targetVal.toString());
            result = (pf.exists == expected);
            displayVal = pf.exists ? "Present" : "Absent";
        } else if ("relationshipValue".equalsIgnoreCase(prop) || "aum".equalsIgnoreCase(prop)) {
            if (!pf.exists) {
                result = false;
                displayVal = "N/A";
            } else if (pf.value == null) {
                missing = true;
                displayVal = "Unknown";
            } else {
                double actual = pf.value;
                double target = Double.parseDouble(targetVal.toString());
                result = compareNumeric(actual, op, target);
                displayVal = "₹" + String.format("%.1fL", actual / 100000.0);
            }
        } else if ("policyStatus".equalsIgnoreCase(prop) || "status".equalsIgnoreCase(prop)) {
            if (!pf.exists) {
                result = false;
                displayVal = "N/A";
            } else if (pf.status == null || "None".equals(pf.status)) {
                missing = true;
                displayVal = "Unknown";
            } else {
                String expected = targetVal.toString();
                result = expected.equalsIgnoreCase(pf.status);
                displayVal = pf.status;
            }
        }

        reasons.add(Opportunity.ReasonItem.builder()
                .label(label)
                .value(displayVal)
                .met(result)
                .build());

        return new ConditionCheckResult(result, missing);
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
        double trv = sheet.totalRelationshipValue != null ? sheet.totalRelationshipValue : 500000.0;
        double val = 0.0;

        String formula = rule.getPotentialValueFormula();
        if (formula != null) {
            if (formula.contains("TRV*0.05")) val = trv * 0.05;
            else if (formula.contains("TRV*0.15")) val = trv * 0.15;
            else if (formula.contains("TRV*0.50")) val = trv * 0.50;
            else if (formula.contains("TRV*0.20")) val = trv * 0.20;
            else if (formula.contains("TRV*0.10")) val = trv * 0.10;
            else if (formula.contains("MF_AUM*0.30")) {
                ProductFact mf = sheet.products.get("mf");
                val = (mf != null && mf.value != null) ? mf.value * 0.30 : trv * 0.10;
            } else {
                val = trv * 0.20;
            }
        } else {
            val = trv * 0.20;
        }

        if (rule.getCeiling() != null && val > rule.getCeiling()) {
            val = rule.getCeiling();
        }

        return val;
    }

    private String generateFactSheetHash(CustomerFactSheet sheet) {
        StringBuilder sb = new StringBuilder();
        sb.append(sheet.totalRelationshipValue).append("|").append(sheet.segment).append("|");
        sheet.products.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> {
                    sb.append(e.getKey()).append(":")
                      .append(e.getValue().exists).append(",")
                      .append(e.getValue().value).append(",")
                      .append(e.getValue().status).append(";");
                });
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            return String.valueOf(sb.toString().hashCode());
        }
    }

    private double calculateRecency(Customer360Response c360) {
        // Simplified calculation for hackathon: check source lineage dates if available
        // Return 0.85 default if not computed
        return 0.85; 
    }

    private double calculateEngagement(Customer360Response c360) {
        long activeCount = c360.getProducts().stream().filter(ProductSummary::isExists).count();
        return Math.min(1.0, activeCount / 5.0);
    }

    private void bundleOpportunities(List<Opportunity> results) {
        Map<String, List<Opportunity>> byCategory = new HashMap<>();
        for (Opportunity opp : results) {
            if ("new".equals(opp.getStatus())) {
                String cat = opp.getCategory() != null ? opp.getCategory() : "GENERAL";
                byCategory.computeIfAbsent(cat, k -> new ArrayList<>()).add(opp);
            }
        }

        for (Map.Entry<String, List<Opportunity>> entry : byCategory.entrySet()) {
            List<Opportunity> catOpps = entry.getValue();
            if (catOpps.size() > 1) {
                catOpps.sort(Comparator.comparingInt(Opportunity::getScore).reversed());
                Opportunity lead = catOpps.get(0);
                lead.setBundleSummary(String.format("%d %s opportunities — showing best", catOpps.size(), entry.getKey().toLowerCase()));
                opportunityRepo.save(lead);

                for (int i = 1; i < catOpps.size(); i++) {
                    Opportunity sub = catOpps.get(i);
                    sub.setStatus("suppressed");
                    sub.setSuppressedByOppId(lead.getId());
                    opportunityRepo.save(sub);
                }
            }
        }
    }
}
