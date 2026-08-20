package com.ps04.customer360.golden.model;

import java.util.List;

public class AttributeConflict {
    private String field;
    private String selectedValue;
    private String selectedSource;
    private List<ConflictingValue> conflictingValues;

    public AttributeConflict() {}

    public AttributeConflict(String field, String selectedValue, String selectedSource, List<ConflictingValue> conflictingValues) {
        this.field = field;
        this.selectedValue = selectedValue;
        this.selectedSource = selectedSource;
        this.conflictingValues = conflictingValues;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String field;
        private String selectedValue;
        private String selectedSource;
        private List<ConflictingValue> conflictingValues;

        public Builder field(String field) { this.field = field; return this; }
        public Builder selectedValue(String selectedValue) { this.selectedValue = selectedValue; return this; }
        public Builder selectedSource(String selectedSource) { this.selectedSource = selectedSource; return this; }
        public Builder conflictingValues(List<ConflictingValue> conflictingValues) { this.conflictingValues = conflictingValues; return this; }

        public AttributeConflict build() {
            return new AttributeConflict(field, selectedValue, selectedSource, conflictingValues);
        }
    }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public String getSelectedValue() { return selectedValue; }
    public void setSelectedValue(String selectedValue) { this.selectedValue = selectedValue; }

    public String getSelectedSource() { return selectedSource; }
    public void setSelectedSource(String selectedSource) { this.selectedSource = selectedSource; }

    public List<ConflictingValue> getConflictingValues() { return conflictingValues; }
    public void setConflictingValues(List<ConflictingValue> conflictingValues) { this.conflictingValues = conflictingValues; }

    public static class ConflictingValue {
        private String value;
        private String source;

        public ConflictingValue() {}

        public ConflictingValue(String value, String source) {
            this.value = value;
            this.source = source;
        }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
    }
}
