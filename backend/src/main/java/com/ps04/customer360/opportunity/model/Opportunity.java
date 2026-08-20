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
