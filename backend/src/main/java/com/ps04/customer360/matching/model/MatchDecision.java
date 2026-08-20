package com.ps04.customer360.matching.model;

/**
 * Final disposition for a (recordA, recordB) pair after scoring AND hard-stop rules.
 */
public enum MatchDecision {
    /** Score >= autoMergeThreshold and no hard-stop rules fired. Create golden record immediately. */
    AUTO_MERGE,

    /** Score in [manualReviewLower, autoMerge) OR a hard-stop rule downgraded a high score. */
    MANUAL_REVIEW,

    /** Score < manualReviewLower, or mobile-only false-positive rule forced separation. */
    SEPARATE
}
