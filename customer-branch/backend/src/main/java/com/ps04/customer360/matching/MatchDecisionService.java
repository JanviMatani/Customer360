package com.ps04.customer360.matching;

import com.ps04.customer360.config_rules.ConfigService;
import com.ps04.customer360.matching.ConflictDetectionService.ConflictCheckResult;
import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.MatchDecision;
import com.ps04.customer360.matching.model.MatchResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Decision engine — combines confidence score + hard-stop rules into a final MatchDecision.
 *
 * Algorithm (§4.8):
 *   1. If hard-conflict forces SEPARATE            → SEPARATE
 *   2. If hard-conflict forces REVIEW              → MANUAL_REVIEW (even if score >= auto-merge)
 *   3. If score >= autoMergeThreshold              → AUTO_MERGE
 *   4. If score >= manualReviewLowerThreshold      → MANUAL_REVIEW
 *   5. Otherwise                                   → SEPARATE
 *
 * Thresholds are READ LIVE from config_rules on every call (never cached at startup).
 * This is what makes PUT /config + POST /admin/rematch actually change outcomes.
 */
@Service
public class MatchDecisionService {

    private final ConfigService configService;
    private final ConflictDetectionService conflictDetectionService;

    public MatchDecisionService(ConfigService configService,
                                ConflictDetectionService conflictDetectionService) {
        this.configService = configService;
        this.conflictDetectionService = conflictDetectionService;
    }

    public record DecisionOutput(
            MatchDecision decision,
            int confidenceScore,
            boolean isDangerousConflict,
            String conflictReason
    ) {}

    /**
     * Produces the final decision for a completed MatchResult.
     */
    public DecisionOutput decide(MatchResult matchResult) {
        Map<String, Object> weights    = configService.getMatchWeights();
        int autoMerge    = (int) weights.getOrDefault("autoMergeThreshold", 85);
        int reviewLower  = (int) weights.getOrDefault("manualReviewLowerThreshold", 60);

        ConflictCheckResult conflict = conflictDetectionService.evaluate(matchResult.getEvidence());

        MatchDecision decision;
        if (conflict.forceSeparate()) {
            decision = MatchDecision.SEPARATE;
        } else if (conflict.forceManualReview()) {
            decision = MatchDecision.MANUAL_REVIEW;
        } else if (matchResult.getConfidenceScore() >= autoMerge) {
            decision = MatchDecision.AUTO_MERGE;
        } else if (matchResult.getConfidenceScore() >= reviewLower) {
            decision = MatchDecision.MANUAL_REVIEW;
        } else {
            decision = MatchDecision.SEPARATE;
        }

        return new DecisionOutput(
                decision,
                matchResult.getConfidenceScore(),
                conflict.isDangerous(),
                conflict.reason()
        );
    }

    /**
     * Overload for direct use from unit tests with a pre-computed score and evidence list,
     * bypassing the MatchResult wrapper.
     */
    public DecisionOutput decideFromEvidence(int score, List<FieldEvidence> evidence,
                                              int autoMergeThreshold, int reviewLowerThreshold) {
        ConflictCheckResult conflict = conflictDetectionService.evaluate(evidence);

        MatchDecision decision;
        if (conflict.forceSeparate()) {
            decision = MatchDecision.SEPARATE;
        } else if (conflict.forceManualReview()) {
            decision = MatchDecision.MANUAL_REVIEW;
        } else if (score >= autoMergeThreshold) {
            decision = MatchDecision.AUTO_MERGE;
        } else if (score >= reviewLowerThreshold) {
            decision = MatchDecision.MANUAL_REVIEW;
        } else {
            decision = MatchDecision.SEPARATE;
        }

        return new DecisionOutput(decision, score, conflict.isDangerous(), conflict.reason());
    }
}
