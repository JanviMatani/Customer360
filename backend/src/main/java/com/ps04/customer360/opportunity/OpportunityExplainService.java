package com.ps04.customer360.opportunity;

import com.ps04.customer360.config_rules.ConfigService;
import com.ps04.customer360.customer360.Customer360Service;
import com.ps04.customer360.customer360.Customer360Service.Customer360Response;
import com.ps04.customer360.customer360.Customer360Service.ProductSummary;
import com.ps04.customer360.opportunity.model.Opportunity;
import com.ps04.customer360.opportunity.model.OpportunityRule;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * OpportunityExplainService
 *
 * Two jobs:
 * 1. For customers with NO opportunities — explain WHY every rule failed,
 *    so the RM understands what the customer needs before qualifying.
 *
 * 2. For customers WITH opportunities — generate a detailed RM pitch context
 *    with talking points, customer relationship summary, and suggested approach.
 */
@Service
public class OpportunityExplainService {

    private final Customer360Service customer360Service;
    private final ConfigService configService;
    private final OpportunityRepo opportunityRepo;

    public OpportunityExplainService(Customer360Service customer360Service,
                                     ConfigService configService,
                                     OpportunityRepo opportunityRepo) {
        this.customer360Service = customer360Service;
        this.configService      = configService;
        this.opportunityRepo    = opportunityRepo;
    }

    // ─── Response shapes ──────────────────────────────────────────────────────

    public record RuleEvaluationDetail(
        String ruleId,
        String product,
        String ruleTitle,
        boolean fired,
        List<ConditionDetail> conditions,
        String summary         // one-line explanation for RM
    ) {}

    public record ConditionDetail(
        String field,
        String operator,
        String requiredValue,
        String actualValue,
        boolean met,
        String gap            // e.g. "₹3.2L short of ₹5L threshold"
    ) {}

    public record NoOpportunityExplanation(
        String goldenId,
        String customerName,
        String segment,
        double totalRelationshipValue,
        List<String> productsHeld,
        List<String> productsMissing,
        List<RuleEvaluationDetail> ruleEvaluations,
        String overallSummary  // RM-readable paragraph
    ) {}

    // ─── Main methods ─────────────────────────────────────────────────────────

    /**
     * Explains why a customer has no qualifying opportunities.
     * Evaluates every active rule and returns detailed gap analysis per rule.
     * Called from GET /api/customers/{goldenId}/opportunity-explain
     */
    public NoOpportunityExplanation explainNoOpportunity(String goldenId) {
        Customer360Response c360 = customer360Service.getCustomer360(goldenId, false);
        List<OpportunityRule> rules = configService.getOpportunityRules();

        Map<String, Double> productValues = buildProductValues(c360);
        Map<String, Boolean> productExists = buildProductExists(c360);
        Map<String, String> productStatus  = buildProductStatus(c360);

        List<String> held    = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (ProductSummary p : c360.getProducts()) {
            if (p.isExists()) held.add(p.getProduct());
            else missing.add(p.getProduct());
        }

        List<RuleEvaluationDetail> evaluations = new ArrayList<>();

        for (OpportunityRule rule : rules) {
            List<ConditionDetail> condDetails = new ArrayList<>();
            boolean ruleFired = true;

            for (var cond : rule.getConditions()) {
                String field = cond.getField();
                String op    = cond.getOp();
                Object req   = cond.getValue();

                String[] parts = field.split("\\.");
                String prod = parts[0].toLowerCase();
                String prop = parts.length > 1 ? parts[1] : "";

                boolean exists = productExists.getOrDefault(prod, false);
                Double value   = productValues.get(prod);
                String status  = productStatus.getOrDefault(prod, "None");

                boolean met = false;
                String actualValue;
                String gap = null;

                if ("exists".equalsIgnoreCase(prop)) {
                    boolean expected = Boolean.parseBoolean(req.toString());
                    met = (exists == expected);
                    actualValue = exists ? "Present" : "Absent";
                    if (!met) {
                        gap = expected
                            ? prod.toUpperCase() + " product needs to be added before this rule can fire"
                            : prod.toUpperCase() + " product must not exist — customer already holds " + prod;
                    }
                } else if ("relationshipValue".equalsIgnoreCase(prop)) {
                    double target = Double.parseDouble(req.toString());
                    if (!exists || value == null) {
                        met = false;
                        actualValue = "Not held";
                        gap = "Customer does not hold " + prod.toUpperCase() + " — relationship value is ₹0";
                    } else {
                        met = compareNumeric(value, op, target);
                        actualValue = formatLakh(value);
                        if (!met) {
                            double shortfall = target - value;
                            gap = "₹" + formatLakh(shortfall) + " short of the ₹" + formatLakh(target) + " threshold";
                        }
                    }
                } else if ("policyStatus".equalsIgnoreCase(prop)) {
                    String expected = req.toString();
                    met = exists && expected.equalsIgnoreCase(status);
                    actualValue = exists ? status : "Not held";
                    if (!met) {
                        gap = exists
                            ? prod.toUpperCase() + " status is '" + status + "', not '" + expected + "'"
                            : "Customer does not hold " + prod.toUpperCase();
                    }
                } else {
                    met = false;
                    actualValue = "—";
                    gap = "Field '" + field + "' could not be evaluated";
                }

                if (!met) ruleFired = false;

                condDetails.add(new ConditionDetail(
                    field, op, formatValue(req, prop), actualValue, met, gap
                ));
            }

            String summary = buildRuleSummary(rule, condDetails, ruleFired, c360);
            evaluations.add(new RuleEvaluationDetail(
                rule.getId(), rule.getProduct(),
                buildRuleTitle(rule),
                ruleFired, condDetails, summary
            ));
        }

        String overallSummary = buildOverallSummary(c360, evaluations, held, missing);

        return new NoOpportunityExplanation(
            goldenId,
            c360.getName(),
            c360.getSegment(),
            c360.getTotalRelationshipValue() != null ? c360.getTotalRelationshipValue() : 0.0,
            held,
            missing,
            evaluations,
            overallSummary
        );
    }

    /**
     * Generates a detailed RM pitch context for an existing opportunity.
     * Called from OpportunityRuleEngine after creating an opportunity.
     */
    public String generateRmPitchContext(Customer360Response c360, Opportunity opp) {
        StringBuilder sb = new StringBuilder();

        String name = c360.getName();
        String segment = c360.getSegment() != null ? c360.getSegment() : "Retail";
        double trv = c360.getTotalRelationshipValue() != null ? c360.getTotalRelationshipValue() : 0;
        String product = opp.getProduct().toUpperCase();

        sb.append("=== RM PITCH GUIDE: ").append(product).append(" OPPORTUNITY ===\n\n");

        // 1. Customer profile snapshot
        sb.append("CUSTOMER SNAPSHOT\n");
        sb.append("Name: ").append(name).append(" | Segment: ").append(segment)
          .append(" | Total Relationship Value: ₹").append(formatLakh(trv)).append("\n");

        // 2. What the customer holds
        sb.append("\nPRODUCT HOLDINGS\n");
        for (ProductSummary p : c360.getProducts()) {
            String indicator = p.isExists() ? "✓" : "✗";
            String val = p.isExists() && p.getRelationshipValue() != null
                ? " — ₹" + formatLakh(p.getRelationshipValue()) + " (" + p.getStatus() + ")"
                : " — Not held";
            sb.append(indicator).append(" ").append(p.getProduct().toUpperCase()).append(val).append("\n");
        }

        // 3. Why this opportunity was generated
        sb.append("\nWHY THIS OPPORTUNITY\n");
        if (opp.getReasons() != null) {
            for (var r : opp.getReasons()) {
                sb.append(r.isMet() ? "✓" : "✗").append(" ").append(r.getLabel())
                  .append(" → ").append(r.getValue()).append("\n");
            }
        }

        // 4. Opportunity specifics
        sb.append("\nOPPORTUNITY DETAILS\n");
        sb.append("Product: ").append(product).append("\n");
        sb.append("Propensity Score: ").append(opp.getScore()).append("/100\n");
        sb.append("Estimated Potential Value: ₹").append(formatLakh(opp.getPotentialValue())).append("\n");
        if (opp.getContactWindow() != null) {
            sb.append("Best Contact Window: ").append(opp.getContactWindow().replace("_", " ")).append("\n");
        }
        if (opp.getSuggestedContactBy() != null) {
            sb.append("Suggested Contact By: ").append(opp.getSuggestedContactBy()).append("\n");
        }

        // 5. Suggested talking points based on product
        sb.append("\nSUGGESTED TALKING POINTS\n");
        sb.append(buildTalkingPoints(product, c360, trv, segment));

        // 6. Contact strategy
        sb.append("\nCONTACT STRATEGY\n");
        sb.append(buildContactStrategy(c360, opp));

        return sb.toString();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private String buildTalkingPoints(String product, Customer360Response c360, double trv, String segment) {
        StringBuilder sb = new StringBuilder();
        switch (product.toUpperCase()) {
            case "INSURANCE" -> {
                sb.append("• Open with: 'I noticed you have strong equity and MF holdings. Have you thought about protecting that wealth?'\n");
                sb.append("• Key message: With ₹").append(formatLakh(trv)).append(" in investments, a term/health cover ensures your family's financial security.\n");
                sb.append("• Pain point: Without insurance, a medical emergency or unfortunate event could deplete these investments.\n");
                sb.append("• Anchor: Premium for a ₹1Cr term plan for your age bracket is typically ₹8K–15K/year — less than 1% of your portfolio value.\n");
            }
            case "WEALTH" -> {
                sb.append("• Open with: 'Your portfolio has grown significantly. You may benefit from dedicated wealth management.'\n");
                sb.append("• Key message: Private wealth advisory optimizes tax efficiency and provides access to PMS/AIF products not available in standard accounts.\n");
                sb.append("• For ").append(segment).append(" segment: Discuss portfolio rebalancing, succession planning, or estate structuring.\n");
            }
            case "MF" -> {
                sb.append("• Open with: 'Your equity holdings show you understand markets. SIPs in MF offer diversification with lower volatility.'\n");
                sb.append("• Key message: A monthly SIP of ₹10K–25K in diversified equity MFs can complement your direct equity portfolio.\n");
                sb.append("• Tax angle: ELSS funds under Section 80C offer ₹1.5L deduction annually.\n");
            }
            case "LOANS" -> {
                sb.append("• Open with: 'Your equity portfolio can be used as collateral for a Loan Against Securities.'\n");
                sb.append("• Key message: LAS rates (10–12% p.a.) are much lower than personal loans. You retain market exposure while accessing liquidity.\n");
                sb.append("• Use case: Emergency fund, business opportunity, or home renovation without liquidating investments.\n");
            }
            default -> {
                sb.append("• Review customer's current product mix and identify the most relevant talking point.\n");
                sb.append("• Reference the customer's relationship value of ₹").append(formatLakh(trv)).append(" to establish credibility.\n");
            }
        }
        return sb.toString();
    }

    private String buildContactStrategy(Customer360Response c360, Opportunity opp) {
        StringBuilder sb = new StringBuilder();
        if (opp.getContactWindow() != null) {
            sb.append("• Preferred contact window: ").append(opp.getContactWindow().replace("_", " ")).append("\n");
        }
        sb.append("• Approach: Personal call first, then follow up with a customized product brochure.\n");
        sb.append("• Avoid: Cold pitch without context. Reference their existing products to establish trust.\n");
        sb.append("• Escalation: If customer shows interest, loop in product specialist within 48 hours.\n");
        if (opp.getScore() >= 75) {
            sb.append("• Priority: HIGH — act within this week.\n");
        } else {
            sb.append("• Priority: MEDIUM — schedule within this month.\n");
        }
        return sb.toString();
    }

    private String buildRuleSummary(OpportunityRule rule, List<ConditionDetail> conditions,
                                     boolean fired, Customer360Response c360) {
        if (fired) {
            return c360.getName() + " qualifies for " + rule.getProduct().toUpperCase()
                   + " — all conditions met.";
        }
        long failedCount = conditions.stream().filter(c -> !c.met()).count();
        String gaps = conditions.stream()
            .filter(c -> !c.met() && c.gap() != null)
            .map(ConditionDetail::gap)
            .reduce((a, b) -> a + "; " + b)
            .orElse("does not meet rule criteria");
        return failedCount + " condition(s) not met: " + gaps;
    }

    private String buildRuleTitle(OpportunityRule rule) {
        return switch (rule.getId()) {
            case "insurance-cross-sell-v1"    -> "Insurance Cross-sell (Equity+MF holders without insurance)";
            case "insurance-reengagement-v1"  -> "Insurance Re-engagement (lapsed policy holders)";
            case "wealth-upgrade-v1"          -> "Private Wealth Advisory (HNI upgrade)";
            case "loan-against-securities-v1" -> "Loan Against Securities";
            default -> rule.getProduct().toUpperCase() + " opportunity rule";
        };
    }

    private String buildOverallSummary(Customer360Response c360, List<RuleEvaluationDetail> evals,
                                        List<String> held, List<String> missing) {
        String name = c360.getName();
        double trv = c360.getTotalRelationshipValue() != null ? c360.getTotalRelationshipValue() : 0;
        long firedCount = evals.stream().filter(RuleEvaluationDetail::fired).count();

        if (firedCount > 0) {
            return name + " qualifies for " + firedCount + " opportunity rule(s). Check the Opportunities tab.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(name).append(" (₹").append(formatLakh(trv)).append(" TRV) currently does not qualify ")
          .append("for any active opportunity rules. ");

        if (missing.isEmpty()) {
            sb.append("Customer holds all 5 product types — fully cross-sold. ");
            sb.append("Focus on deepening existing relationships: increasing AUM, upgrading segments, or product top-ups.");
        } else {
            sb.append("Missing products: ").append(String.join(", ", missing)).append(". ");

            // Find the closest-to-qualifying rule
            evals.stream()
                 .min((a, b) -> Long.compare(
                     b.conditions().stream().filter(ConditionDetail::met).count(),
                     a.conditions().stream().filter(ConditionDetail::met).count()))
                 .ifPresent(closest -> {
                     long metCount = closest.conditions().stream().filter(ConditionDetail::met).count();
                     long totalCount = closest.conditions().size();
                     sb.append("Closest rule: '").append(closest.ruleTitle())
                       .append("' — ").append(metCount).append("/").append(totalCount)
                       .append(" conditions met. ");
                     // Find specific gaps
                     closest.conditions().stream()
                            .filter(c -> !c.met() && c.gap() != null)
                            .findFirst()
                            .ifPresent(gap -> sb.append("Key gap: ").append(gap.gap()).append("."));
                 });
        }

        return sb.toString();
    }

    private Map<String, Double> buildProductValues(Customer360Response c360) {
        Map<String, Double> map = new java.util.HashMap<>();
        if (c360.getProducts() != null) {
            for (ProductSummary p : c360.getProducts()) {
                map.put(p.getProduct().toLowerCase(), p.getRelationshipValue());
            }
        }
        return map;
    }

    private Map<String, Boolean> buildProductExists(Customer360Response c360) {
        Map<String, Boolean> map = new java.util.HashMap<>();
        if (c360.getProducts() != null) {
            for (ProductSummary p : c360.getProducts()) {
                map.put(p.getProduct().toLowerCase(), p.isExists());
            }
        }
        return map;
    }

    private Map<String, String> buildProductStatus(Customer360Response c360) {
        Map<String, String> map = new java.util.HashMap<>();
        if (c360.getProducts() != null) {
            for (ProductSummary p : c360.getProducts()) {
                map.put(p.getProduct().toLowerCase(), p.getStatus() != null ? p.getStatus() : "None");
            }
        }
        return map;
    }

    private boolean compareNumeric(double actual, String op, double target) {
        return switch (op) {
            case ">"  -> actual > target;
            case ">=" -> actual >= target;
            case "<"  -> actual < target;
            case "<=" -> actual <= target;
            case "="  -> Math.abs(actual - target) < 0.01;
            default   -> false;
        };
    }

    private String formatLakh(double value) {
        if (value == 0) return "0";
        if (value >= 10_000_000) return String.format("%.2fCr", value / 10_000_000);
        if (value >= 100_000)    return String.format("%.1fL", value / 100_000);
        if (value >= 1_000)      return String.format("%.1fK", value / 1_000);
        return String.format("%.0f", value);
    }

    private String formatLakh(Double value) {
        return value == null ? "0" : formatLakh(value.doubleValue());
    }

    private String formatValue(Object val, String prop) {
        if (val == null) return "—";
        if ("relationshipValue".equalsIgnoreCase(prop)) {
            try {
                return "₹" + formatLakh(Double.parseDouble(val.toString()));
            } catch (NumberFormatException e) {
                return val.toString();
            }
        }
        return val.toString();
    }
}
