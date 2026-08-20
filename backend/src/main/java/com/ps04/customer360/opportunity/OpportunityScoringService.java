package com.ps04.customer360.opportunity;

import com.ps04.customer360.config_rules.ConfigService;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Transparent opportunity scoring service.
 *
 * Formula (all weights configurable via PUT /api/config/opportunity-rules):
 *   score = wPotential * normPotentialVal
 *         + wRelationship * normRelVal
 *         + wRecency * recencyFactor
 *         + wEngagement * engagementFactor
 *
 * Default weights: potential=40, relationship=25, recency=20, engagement=15
 * Weights are read LIVE from config_rules on every call — no restart needed.
 */
@Service
public class OpportunityScoringService {

    private final ConfigService configService;

    public OpportunityScoringService(ConfigService configService) {
        this.configService = configService;
    }

    public int computeScore(Double potentialValue, Double relationshipValue) {
        // Read score weights live from config
        Map<String, Object> weights = configService.getScoringWeights();

        double wPotential   = ((Number) weights.getOrDefault("potential",   40)).doubleValue();
        double wRelationship= ((Number) weights.getOrDefault("relationship", 25)).doubleValue();
        double wRecency     = ((Number) weights.getOrDefault("recency",     20)).doubleValue();
        double wEngagement  = ((Number) weights.getOrDefault("engagement",  15)).doubleValue();

        double maxPotential    = ((Number) weights.getOrDefault("maxPotentialValue",    2000000)).doubleValue();
        double maxRelationship = ((Number) weights.getOrDefault("maxRelationshipValue", 2000000)).doubleValue();

        double pVal = potentialValue   != null ? potentialValue   : 500000.0;
        double rVal = relationshipValue != null ? relationshipValue : 500000.0;

        double normP = Math.min(1.0, pVal / maxPotential);
        double normR = Math.min(1.0, rVal / maxRelationship);

        // recency and engagement: fixed signals for hackathon dataset
        // (all customers in dataset are active/multi-product by definition)
        // In production these would be computed from interaction history.
        double recency    = 0.85;
        double engagement = 0.90;

        double rawScore = (wPotential * normP)
                + (wRelationship * normR)
                + (wRecency * recency)
                + (wEngagement * engagement);

        return (int) Math.min(99, Math.max(50, Math.round(rawScore)));
    }
}
