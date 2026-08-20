package com.ps04.customer360.config_rules;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.opportunity.model.OpportunityRule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

/**
 * ConfigService — reads configuration from the config_rules MongoDB collection.
 *
 * IMPORTANT: reads are performed on EVERY CALL — no startup cache.
 * This is intentional: PUT /config + POST /admin/rematch must reflect the new config
 * immediately, without requiring a server restart. The collection is tiny (2 docs),
 * so the per-call overhead is negligible at hackathon scale.
 */
@Service
public class ConfigService {

    private static final Logger log = LoggerFactory.getLogger(ConfigService.class);

    private static final String COLLECTION   = "config_rules";
    private static final String WEIGHTS_ID   = "match-weights-v1";
    private static final String OPP_RULES_ID = "opportunity-rules-v1";

    private final MongoTemplate mongo;

    public ConfigService(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    // ─── Match weights ────────────────────────────────────────────────────

    /** Returns the full match-weights config document as a raw map. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getMatchWeights() {
        Map<String, Object> doc = mongo.findById(WEIGHTS_ID, Map.class, COLLECTION);
        if (doc == null) {
            log.warn("No match-weights config found — using defaults");
            return defaultMatchWeights();
        }
        return doc;
    }

    /** Returns just the field-weight sub-map {pan:40, mobile:25, ...}. */
    @SuppressWarnings("unchecked")
    public Map<String, Integer> getFieldWeights() {
        Map<String, Object> doc = getMatchWeights();
        Object w = doc.get("weights");
        if (w instanceof Map<?, ?> map) {
            Map<String, Integer> result = new LinkedHashMap<>();
            map.forEach((k, v) -> result.put(k.toString(), ((Number) v).intValue()));
            return result;
        }
        return defaultFieldWeights();
    }

    public int getAutoMergeThreshold() {
        return ((Number) getMatchWeights().getOrDefault("autoMergeThreshold", 85)).intValue();
    }

    public int getManualReviewLowerThreshold() {
        return ((Number) getMatchWeights().getOrDefault("manualReviewLowerThreshold", 60)).intValue();
    }

    // ─── Opportunity rules ────────────────────────────────────────────────

    /** Returns all active opportunity rules as typed objects. */
    @SuppressWarnings("unchecked")
    public List<OpportunityRule> getOpportunityRules() {
        Map<String, Object> doc = mongo.findById(OPP_RULES_ID, Map.class, COLLECTION);
        if (doc == null) return List.of();

        List<Map<String, Object>> rulesRaw = (List<Map<String, Object>>) doc.get("rules");
        if (rulesRaw == null) return List.of();

        List<OpportunityRule> rules = new ArrayList<>();
        for (Map<String, Object> r : rulesRaw) {
            Boolean active = (Boolean) r.getOrDefault("active", true);
            if (!active) continue;

            List<OpportunityRule.RuleCondition> conditions = new ArrayList<>();
            List<Map<String, Object>> condsRaw = (List<Map<String, Object>>) r.get("conditions");
            if (condsRaw != null) {
                for (Map<String, Object> c : condsRaw) {
                    conditions.add(OpportunityRule.RuleCondition.builder()
                            .field((String) c.get("field"))
                            .op((String) c.get("op"))
                            .value(c.get("value"))
                            .build());
                }
            }

            rules.add(OpportunityRule.builder()
                    .id((String) r.get("id"))
                    .product((String) r.get("product"))
                    .category((String) r.getOrDefault("category", "GENERAL"))
                    .potentialValueFormula((String) r.getOrDefault("potentialValueFormula", "DEFAULT"))
                    .ceiling(r.get("ceiling") != null ? ((Number) r.get("ceiling")).doubleValue() : null)
                    .conditions(conditions)
                    .minScore(((Number) r.getOrDefault("minScore", 50)).intValue())
                    .active(true)
                    .build());
        }
        return rules;
    }

    /**
     * Returns the raw opportunity-rules config document (for GET endpoint and audit before/after).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getOpportunityRulesRaw() {
        Map<String, Object> doc = mongo.findById(OPP_RULES_ID, Map.class, COLLECTION);
        if (doc == null) return Map.of("_id", OPP_RULES_ID, "rules", List.of());
        return doc;
    }

    // ─── Scoring weights ─────────────────────────────────────────────────

    /**
     * Returns the opportunity scoring weights sub-map.
     * Stored under the opportunity-rules-v1 document as "scoringWeights".
     * Defaults: potential=40, relationship=25, recency=20, engagement=15
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getScoringWeights() {
        Map<String, Object> doc = getOpportunityRulesRaw();
        Object sw = doc.get("scoringWeights");
        if (sw instanceof Map<?, ?> map) {
            Map<String, Object> result = new java.util.LinkedHashMap<>();
            map.forEach((k, v) -> result.put(k.toString(), v));
            return result;
        }
        return defaultScoringWeights();
    }

    private Map<String, Object> defaultScoringWeights() {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("potential",          40);
        m.put("relationship",       25);
        m.put("recency",            20);
        m.put("engagement",         15);
        m.put("maxPotentialValue",  2000000);
        m.put("maxRelationshipValue", 2000000);
        return m;
    }

    // ─── Config update ────────────────────────────────────────────────────

    /**
     * Persists a new match-weights config document (versioned).
     * Validation (weights sum to 100, thresholds ordered) must be done by the caller.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> updateMatchWeights(Map<String, Object> newConfig, String updatedBy) {
        Map<String, Object> existing = getMatchWeights();
        int newVersion = ((Number) existing.getOrDefault("version", 0)).intValue() + 1;

        newConfig.put("_id", WEIGHTS_ID);
        newConfig.put("type", "MATCH_WEIGHTS");
        newConfig.put("updatedBy", updatedBy);
        newConfig.put("updatedAt", Instant.now().toString());
        newConfig.put("version", newVersion);

        mongo.save(newConfig, COLLECTION);
        return newConfig;
    }

    public Map<String, Object> updateOpportunityRules(Map<String, Object> newConfig, String updatedBy) {
        newConfig.put("_id", OPP_RULES_ID);
        newConfig.put("type", "OPPORTUNITY_RULES");
        newConfig.put("updatedBy", updatedBy);
        newConfig.put("updatedAt", Instant.now().toString());
        mongo.save(newConfig, COLLECTION);
        return newConfig;
    }

    // ─── Defaults (first-run / missing config) ────────────────────────────

    private Map<String, Object> defaultMatchWeights() {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("_id", WEIGHTS_ID);
        doc.put("type", "MATCH_WEIGHTS");
        doc.put("weights", defaultFieldWeights());
        doc.put("autoMergeThreshold", 85);
        doc.put("manualReviewLowerThreshold", 60);
        doc.put("version", 1);
        return doc;
    }

    private Map<String, Integer> defaultFieldWeights() {
        return Map.of("pan", 40, "mobile", 25, "email", 15, "dob", 10, "name", 7, "city", 3);
    }
}
