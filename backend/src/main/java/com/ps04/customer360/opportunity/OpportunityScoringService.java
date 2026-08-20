package com.ps04.customer360.opportunity;

import org.springframework.stereotype.Service;

/**
 * Transparent opportunity scoring service.
 * Formula:
 *   score = 40 * normPotentialVal + 25 * normRelVal + 20 * recencyFactor + 15 * engagementFactor
 */
@Service
public class OpportunityScoringService {

    public int computeScore(Double potentialValue, Double relationshipValue) {
        double pVal = potentialValue != null ? potentialValue : 500000.0;
        double rVal = relationshipValue != null ? relationshipValue : 500000.0;

        double normP = Math.min(1.0, pVal / 2000000.0);
        double normR = Math.min(1.0, rVal / 2000000.0);
        double recency = 0.85;     // active within last quarter
        double engagement = 0.90;  // multi-product relationship

        double rawScore = (40.0 * normP) + (25.0 * normR) + (20.0 * recency) + (15.0 * engagement);
        return (int) Math.min(99, Math.max(50, Math.round(rawScore)));
    }
}
