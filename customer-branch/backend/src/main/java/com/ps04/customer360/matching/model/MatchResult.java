package com.ps04.customer360.matching.model;

import java.util.List;

public class MatchResult {

    private String sourceSystemA;
    private String sourceCustomerIdA;

    private String sourceSystemB;
    private String sourceCustomerIdB;

    private int confidenceScore;
    private List<FieldEvidence> evidence;

    private boolean hasHardConflict;
    private String hardConflictReason;
    private boolean isDangerousConflict;

    public MatchResult() {}

    public MatchResult(String sourceSystemA, String sourceCustomerIdA, String sourceSystemB, String sourceCustomerIdB, int confidenceScore, List<FieldEvidence> evidence, boolean hasHardConflict, String hardConflictReason, boolean isDangerousConflict) {
        this.sourceSystemA = sourceSystemA;
        this.sourceCustomerIdA = sourceCustomerIdA;
        this.sourceSystemB = sourceSystemB;
        this.sourceCustomerIdB = sourceCustomerIdB;
        this.confidenceScore = confidenceScore;
        this.evidence = evidence;
        this.hasHardConflict = hasHardConflict;
        this.hardConflictReason = hardConflictReason;
        this.isDangerousConflict = isDangerousConflict;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String sourceSystemA;
        private String sourceCustomerIdA;
        private String sourceSystemB;
        private String sourceCustomerIdB;
        private int confidenceScore;
        private List<FieldEvidence> evidence;
        private boolean hasHardConflict;
        private String hardConflictReason;
        private boolean isDangerousConflict;

        public Builder sourceSystemA(String sourceSystemA) { this.sourceSystemA = sourceSystemA; return this; }
        public Builder sourceCustomerIdA(String sourceCustomerIdA) { this.sourceCustomerIdA = sourceCustomerIdA; return this; }
        public Builder sourceSystemB(String sourceSystemB) { this.sourceSystemB = sourceSystemB; return this; }
        public Builder sourceCustomerIdB(String sourceCustomerIdB) { this.sourceCustomerIdB = sourceCustomerIdB; return this; }
        public Builder confidenceScore(int confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public Builder evidence(List<FieldEvidence> evidence) { this.evidence = evidence; return this; }
        public Builder hasHardConflict(boolean hasHardConflict) { this.hasHardConflict = hasHardConflict; return this; }
        public Builder hardConflictReason(String hardConflictReason) { this.hardConflictReason = hardConflictReason; return this; }
        public Builder isDangerousConflict(boolean isDangerousConflict) { this.isDangerousConflict = isDangerousConflict; return this; }

        public MatchResult build() {
            return new MatchResult(sourceSystemA, sourceCustomerIdA, sourceSystemB, sourceCustomerIdB, confidenceScore, evidence, hasHardConflict, hardConflictReason, isDangerousConflict);
        }
    }

    public String getSourceSystemA() { return sourceSystemA; }
    public void setSourceSystemA(String sourceSystemA) { this.sourceSystemA = sourceSystemA; }

    public String getSourceCustomerIdA() { return sourceCustomerIdA; }
    public void setSourceCustomerIdA(String sourceCustomerIdA) { this.sourceCustomerIdA = sourceCustomerIdA; }

    public String getSourceSystemB() { return sourceSystemB; }
    public void setSourceSystemB(String sourceSystemB) { this.sourceSystemB = sourceSystemB; }

    public String getSourceCustomerIdB() { return sourceCustomerIdB; }
    public void setSourceCustomerIdB(String sourceCustomerIdB) { this.sourceCustomerIdB = sourceCustomerIdB; }

    public int getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(int confidenceScore) { this.confidenceScore = confidenceScore; }

    public List<FieldEvidence> getEvidence() { return evidence; }
    public void setEvidence(List<FieldEvidence> evidence) { this.evidence = evidence; }

    public boolean isHasHardConflict() { return hasHardConflict; }
    public void setHasHardConflict(boolean hasHardConflict) { this.hasHardConflict = hasHardConflict; }

    public String getHardConflictReason() { return hardConflictReason; }
    public void setHardConflictReason(String hardConflictReason) { this.hardConflictReason = hardConflictReason; }

    public boolean isDangerousConflict() { return isDangerousConflict; }
    public void setDangerousConflict(boolean dangerousConflict) { isDangerousConflict = dangerousConflict; }
}
