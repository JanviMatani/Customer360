package com.ps04.customer360.matching;

import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Conflict detection service implementing the three hard-stop rules from §4.7.
 *
 * These rules run AFTER the weighted score is computed and can only push
 * a decision DOWN (toward REVIEW or SEPARATE), never up.
 *
 * Hard-stop rules (all config-driven, referenced by id):
 *
 * Rule 1 — "pan-dob-double-conflict":
 *   PAN field evidence = CONFLICT **and** DOB field evidence = CONFLICT
 *   → force MANUAL_REVIEW minimum (a human should see it, but it's not necessarily two
 *     different people — one value could be a data-entry error).
 *   Outcome: MANUAL_REVIEW (never downgraded to SEPARATE outright by this rule alone).
 *
 * Rule 2 — "pan-name-mismatch":
 *   PAN evidence = MATCH **and** name similarity < 60%
 *   → force MANUAL_REVIEW even if raw weighted score >= autoMergeThreshold.
 *   Rationale: PAN collision landmine (Rahul Kumar/EQ1010 vs Rahul Sharmai/WEA3018).
 *   A high PAN-match weight alone could push the score above auto-merge; this rule
 *   prevents that dangerous auto-merge from happening silently.
 *   isDangerousConflict = true on the resulting queue item.
 *
 * Rule 3 — "mobile-only-no-corroboration":
 *   Only mobile matches; PAN is present on BOTH sides and is CONFLICT; name similarity < 40%
 *   → force SEPARATE (not even MANUAL_REVIEW).
 *   Rationale: shared-mobile false positive (Rahul Sharma / Amit Patil both have 9876543210).
 *   PAN explicitly differs, name completely different → this is noise, not ambiguity.
 *   Do NOT queue it for review — keeps the review queue meaningful.
 */
@Service
public class ConflictDetectionService {

    /** Threshold below which a name similarity triggers rule 2 (PAN-match + low name similarity). */
    public static final double PAN_NAME_MISMATCH_THRESHOLD = 0.60;

    /** Threshold below which a name similarity triggers rule 3 (mobile-only false positive). */
    public static final double MOBILE_ONLY_NAME_THRESHOLD = 0.40;

    public record ConflictCheckResult(
            boolean hasHardConflict,
            boolean forceSeparate,         // true → decision MUST be SEPARATE
            boolean forceManualReview,     // true → decision MUST be MANUAL_REVIEW (or SEPARATE)
            boolean isDangerous,
            String reason
    ) {
        public static ConflictCheckResult none() {
            return new ConflictCheckResult(false, false, false, false, null);
        }
    }

    /**
     * Evaluates all active hard-stop rules against the evidence list.
     * Returns the most severe applicable override.
     */
    public ConflictCheckResult evaluate(List<FieldEvidence> evidence) {
        FieldEvidence panEv    = find(evidence, "pan");
        FieldEvidence mobileEv = find(evidence, "mobile");
        FieldEvidence dobEv    = find(evidence, "dob");
        FieldEvidence nameEv   = find(evidence, "name");

        double nameSimilarity = (nameEv != null && nameEv.getSimilarity() != null)
                ? nameEv.getSimilarity()
                : (nameEv != null && nameEv.getResult() == MatchResult.MATCH ? 1.0 : 0.0);

        // ── Rule 3: mobile-only false positive (SEPARATE — highest priority override) ──
        if (mobileEv != null && mobileEv.getResult() == MatchResult.MATCH) {
            boolean panBothPresentAndConflicts =
                    panEv != null
                    && panEv.getResult() == MatchResult.CONFLICT
                    && panEv.getValueA() != null
                    && panEv.getValueB() != null;

            if (panBothPresentAndConflicts && nameSimilarity < MOBILE_ONLY_NAME_THRESHOLD) {
                return new ConflictCheckResult(true, true, false, false,
                        "Mobile match alone — PAN explicitly different on both sides and name similarity "
                        + String.format("%.0f%%", nameSimilarity * 100)
                        + " < 40%: shared-mobile false positive, force SEPARATE");
            }
        }

        // ── Rule 2: PAN match + name similarity < 60% (force MANUAL_REVIEW, dangerous) ──
        if (panEv != null && panEv.getResult() == MatchResult.MATCH) {
            if (nameSimilarity < PAN_NAME_MISMATCH_THRESHOLD) {
                return new ConflictCheckResult(true, false, true, true,
                        "PAN matched but name similarity "
                        + String.format("%.0f%%", nameSimilarity * 100)
                        + " < 60%: possible PAN collision, force MANUAL_REVIEW");
            }
        }

        // ── Rule 1: PAN conflict AND DOB conflict (force MANUAL_REVIEW) ──
        if (panEv != null && panEv.getResult() == MatchResult.CONFLICT
                && dobEv != null && dobEv.getResult() == MatchResult.CONFLICT) {
            return new ConflictCheckResult(true, false, true, false,
                    "Both PAN and DOB conflict — data quality issue, force MANUAL_REVIEW");
        }

        return ConflictCheckResult.none();
    }

    private FieldEvidence find(List<FieldEvidence> evidence, String field) {
        return evidence.stream()
                .filter(e -> field.equals(e.getField()))
                .findFirst()
                .orElse(null);
    }
}
