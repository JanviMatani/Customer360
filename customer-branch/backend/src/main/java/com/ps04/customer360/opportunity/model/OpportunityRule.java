package com.ps04.customer360.opportunity.model;

import java.util.List;

public class OpportunityRule {

    private String id;
    private String product;
    private String category;              // INVESTMENT | PROTECTION | CREDIT | WEALTH
    private String potentialValueFormula; // e.g. "TRV*0.05" (descriptive, handled in engine)
    private Double ceiling;               // max potentialValue cap in ₹
    private List<RuleCondition> conditions;
    private int minScore;
    private boolean active;

    public OpportunityRule() {}

    public OpportunityRule(String id, String product, String category, String potentialValueFormula, Double ceiling, List<RuleCondition> conditions, int minScore, boolean active) {
        this.id = id;
        this.product = product;
        this.category = category;
        this.potentialValueFormula = potentialValueFormula;
        this.ceiling = ceiling;
        this.conditions = conditions;
        this.minScore = minScore;
        this.active = active;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String product;
        private String category;
        private String potentialValueFormula;
        private Double ceiling;
        private List<RuleCondition> conditions;
        private int minScore;
        private boolean active;

        public Builder id(String id) { this.id = id; return this; }
        public Builder product(String product) { this.product = product; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder potentialValueFormula(String f) { this.potentialValueFormula = f; return this; }
        public Builder ceiling(Double ceiling) { this.ceiling = ceiling; return this; }
        public Builder conditions(List<RuleCondition> conditions) { this.conditions = conditions; return this; }
        public Builder minScore(int minScore) { this.minScore = minScore; return this; }
        public Builder active(boolean active) { this.active = active; return this; }

        public OpportunityRule build() {
            return new OpportunityRule(id, product, category, potentialValueFormula, ceiling, conditions, minScore, active);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPotentialValueFormula() { return potentialValueFormula; }
    public void setPotentialValueFormula(String f) { this.potentialValueFormula = f; }

    public Double getCeiling() { return ceiling; }
    public void setCeiling(Double ceiling) { this.ceiling = ceiling; }

    public List<RuleCondition> getConditions() { return conditions; }
    public void setConditions(List<RuleCondition> conditions) { this.conditions = conditions; }

    public int getMinScore() { return minScore; }
    public void setMinScore(int minScore) { this.minScore = minScore; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static class RuleCondition {
        private String field;
        private String op;
        private Object value;

        public RuleCondition() {}

        public RuleCondition(String field, String op, Object value) {
            this.field = field;
            this.op = op;
            this.value = value;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String field;
            private String op;
            private Object value;

            public Builder field(String field) { this.field = field; return this; }
            public Builder op(String op) { this.op = op; return this; }
            public Builder value(Object value) { this.value = value; return this; }

            public RuleCondition build() { return new RuleCondition(field, op, value); }
        }

        public String getField() { return field; }
        public void setField(String field) { this.field = field; }

        public String getOp() { return op; }
        public void setOp(String op) { this.op = op; }

        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
    }
}
