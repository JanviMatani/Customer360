package com.ps04.customer360.matching;

import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Confidence scoring service.
 *
 * Computes a 0-100 score from a list of FieldEvidence items using configured weights.
 *
 * KEY DESIGN: score is RENORMALIZED over non-MISSING fields only.
 *
 * Formula:
 *   numerator   = Σ weight_i × matchFactor_i   for fields where result != MISSING
 *   denominator = Σ weight_i                   for fields where result != MISSING
 *   score       = (numerator / denominator) × 100
 *
 * matchFactor:
 *   MATCH    → 1.0
 *   CONFLICT → 0.0
 *   PARTIAL  → evidence.similarity (0.0 to 1.0)
 *   MISSING  → not included in either sum
 *
 * Example (Sneha Iyer — no PAN/mobile/email anywhere):
 *   Only name(7) + dob(10) + city(3) are non-MISSING → denominator = 20
 *   If all three match → numerator = 20 → score = 100%
 *   This is correct: a sparse but genuinely-matching pair should score high,
 *   not be penalized for fields that simply don't exist in the source data.
 */
@Service
public class ConfidenceScoringService {

    public int computeScore(List<FieldEvidence> evidence) {
        double numerator   = 0.0;
        double denominator = 0.0;

        for (FieldEvidence fe : evidence) {
            if (fe.getResult() == MatchResult.MISSING) continue;

            double factor = switch (fe.getResult()) {
                case MATCH    -> 1.0;
                case CONFLICT -> 0.0;
                case PARTIAL  -> (fe.getSimilarity() != null ? fe.getSimilarity() : 0.0);
                default       -> 0.0;
            };

            numerator   += fe.getWeight() * factor;
            denominator += fe.getWeight();
        }

        if (denominator == 0.0) return 0;
        return (int) Math.round((numerator / denominator) * 100.0);
    }
}
