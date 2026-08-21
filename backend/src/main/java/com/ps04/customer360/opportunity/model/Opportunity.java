package com.ps04.customer360.opportunity.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "opportunities")
@CompoundIndex(name = "golden_rule_idx", def = "{'goldenId': 1, 'ruleId': 1}", unique = true)
public class Opportunity {

    @Id
    private String id;

    @Indexed
    private String goldenId;
    private String customerName;

    @Indexed
    private String rmId;

    private String product;
    private int score;
    private Double potentialValue;

    private String status;
    private String dismissedReason;

    private String ruleId;
    private List<ReasonItem> reasons;

    private Instant generatedAt;
    private Instant updatedAt;
    private Instant lastScoredAt;

    // Feature 3 — Staleness
    private String factSheetHash;

    // Feature 4 — Missing data
    private String dataCompleteness;   // "COMPLETE" | "INCOMPLETE"
    private List<String> missingFields;

    // Feature 5 — Bundling / suppression
    private String category;           // "INVESTMENT" | "PROTECTION" | "CREDIT" | "WEALTH"
    private boolean suppressed;
    private String suppressedByOppId;
    private String bundleSummary;

    // Feature 6 — Contact timing
    private String contactWindow;      // e.g. "MORNING_WEEKDAY"
    private String suggestedContactBy; // ISO date string
    private String contactReason;

    // Feature 7 — AI summary / RM pitch context
    private String aiSummary;

    // RM Pitch Context — detailed talking points for the RM when approaching the customer
    // Contains: customer relationship summary, product gaps, suggested pitch, key signals
    private String rmPitchContext;

    public Opportunity() {}

    public Opportunity(String id, String goldenId, String customerName, String rmId, String product, int score, Double potentialValue, String status, String dismissedReason, String ruleId, List<ReasonItem> reasons, Instant generatedAt, Instant updatedAt) {
        this.id = id;
        this.goldenId = goldenId;
        this.customerName = customerName;
        this.rmId = rmId;
        this.product = product;
        this.score = score;
        this.potentialValue = potentialValue;
        this.status = status;
        this.dismissedReason = dismissedReason;
        this.ruleId = ruleId;
        this.reasons = reasons;
        this.generatedAt = generatedAt;
        this.updatedAt = updatedAt;
        this.lastScoredAt = null;
        this.factSheetHash = null;
        this.dataCompleteness = "COMPLETE";
        this.missingFields = null;
        this.category = null;
        this.suppressed = false;
        this.suppressedByOppId = null;
        this.bundleSummary = null;
        this.contactWindow = null;
        this.suggestedContactBy = null;
        this.contactReason = null;
        this.aiSummary = null;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String goldenId;
        private String customerName;
        private String rmId;
        private String product;
        private int score;
        private Double potentialValue;
        private String status;
        private String dismissedReason;
        private String ruleId;
        private List<ReasonItem> reasons;
        private Instant generatedAt;
        private Instant updatedAt;
        private Instant lastScoredAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder goldenId(String goldenId) { this.goldenId = goldenId; return this; }
        public Builder customerName(String customerName) { this.customerName = customerName; return this; }
        public Builder rmId(String rmId) { this.rmId = rmId; return this; }
        public Builder product(String product) { this.product = product; return this; }
        public Builder score(int score) { this.score = score; return this; }
        public Builder potentialValue(Double potentialValue) { this.potentialValue = potentialValue; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder dismissedReason(String dismissedReason) { this.dismissedReason = dismissedReason; return this; }
        public Builder ruleId(String ruleId) { this.ruleId = ruleId; return this; }
        public Builder reasons(List<ReasonItem> reasons) { this.reasons = reasons; return this; }
        public Builder generatedAt(Instant generatedAt) { this.generatedAt = generatedAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder lastScoredAt(Instant lastScoredAt) { this.lastScoredAt = lastScoredAt; return this; }

        public Opportunity build() {
            return new Opportunity(id, goldenId, customerName, rmId, product, score, potentialValue, status, dismissedReason, ruleId, reasons, generatedAt, updatedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGoldenId() { return goldenId; }
    public void setGoldenId(String goldenId) { this.goldenId = goldenId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getRmId() { return rmId; }
    public void setRmId(String rmId) { this.rmId = rmId; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public Double getPotentialValue() { return potentialValue; }
    public void setPotentialValue(Double potentialValue) { this.potentialValue = potentialValue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDismissedReason() { return dismissedReason; }
    public void setDismissedReason(String dismissedReason) { this.dismissedReason = dismissedReason; }

    public String getRuleId() { return ruleId; }
    public void setRuleId(String ruleId) { this.ruleId = ruleId; }

    public List<ReasonItem> getReasons() { return reasons; }
    public void setReasons(List<ReasonItem> reasons) { this.reasons = reasons; }

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getLastScoredAt() { return lastScoredAt; }
    public void setLastScoredAt(Instant lastScoredAt) { this.lastScoredAt = lastScoredAt; }

    public String getFactSheetHash() { return factSheetHash; }
    public void setFactSheetHash(String factSheetHash) { this.factSheetHash = factSheetHash; }

    public String getDataCompleteness() { return dataCompleteness; }
    public void setDataCompleteness(String dataCompleteness) { this.dataCompleteness = dataCompleteness; }

    public List<String> getMissingFields() { return missingFields; }
    public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isSuppressed() { return suppressed; }
    public void setSuppressed(boolean suppressed) { this.suppressed = suppressed; }

    public String getSuppressedByOppId() { return suppressedByOppId; }
    public void setSuppressedByOppId(String suppressedByOppId) { this.suppressedByOppId = suppressedByOppId; }

    public String getBundleSummary() { return bundleSummary; }
    public void setBundleSummary(String bundleSummary) { this.bundleSummary = bundleSummary; }

    public String getContactWindow() { return contactWindow; }
    public void setContactWindow(String contactWindow) { this.contactWindow = contactWindow; }

    public String getSuggestedContactBy() { return suggestedContactBy; }
    public void setSuggestedContactBy(String suggestedContactBy) { this.suggestedContactBy = suggestedContactBy; }

    public String getContactReason() { return contactReason; }
    public void setContactReason(String contactReason) { this.contactReason = contactReason; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public String getRmPitchContext() { return rmPitchContext; }
    public void setRmPitchContext(String rmPitchContext) { this.rmPitchContext = rmPitchContext; }

    public static class ReasonItem {
        private String label;
        private String value;
        private boolean met;

        public ReasonItem() {}

        public ReasonItem(String label, String value, boolean met) {
            this.label = label;
            this.value = value;
            this.met = met;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String label;
            private String value;
            private boolean met;

            public Builder label(String label) { this.label = label; return this; }
            public Builder value(String value) { this.value = value; return this; }
            public Builder met(boolean met) { this.met = met; return this; }

            public ReasonItem build() { return new ReasonItem(label, value, met); }
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }

        public boolean isMet() { return met; }
        public void setMet(boolean met) { this.met = met; }
    }
}
