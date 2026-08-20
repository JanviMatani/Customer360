package com.ps04.customer360.matching.model;

public class FieldEvidence {

    private String field;
    private String valueA;
    private String valueB;
    private int weight;
    private MatchResult result;
    private Double similarity;

    public enum MatchResult {
        MATCH,
        CONFLICT,
        MISSING,
        PARTIAL
    }

    public FieldEvidence() {}

    public FieldEvidence(String field, String valueA, String valueB, int weight, MatchResult result, Double similarity) {
        this.field = field;
        this.valueA = valueA;
        this.valueB = valueB;
        this.weight = weight;
        this.result = result;
        this.similarity = similarity;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String field;
        private String valueA;
        private String valueB;
        private int weight;
        private MatchResult result;
        private Double similarity;

        public Builder field(String field) { this.field = field; return this; }
        public Builder valueA(String valueA) { this.valueA = valueA; return this; }
        public Builder valueB(String valueB) { this.valueB = valueB; return this; }
        public Builder weight(int weight) { this.weight = weight; return this; }
        public Builder result(MatchResult result) { this.result = result; return this; }
        public Builder similarity(Double similarity) { this.similarity = similarity; return this; }

        public FieldEvidence build() {
            return new FieldEvidence(field, valueA, valueB, weight, result, similarity);
        }
    }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public String getValueA() { return valueA; }
    public void setValueA(String valueA) { this.valueA = valueA; }

    public String getValueB() { return valueB; }
    public void setValueB(String valueB) { this.valueB = valueB; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public MatchResult getResult() { return result; }
    public void setResult(MatchResult result) { this.result = result; }

    public Double getSimilarity() { return similarity; }
    public void setSimilarity(Double similarity) { this.similarity = similarity; }
}
