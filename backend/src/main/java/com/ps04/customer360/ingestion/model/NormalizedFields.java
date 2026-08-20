package com.ps04.customer360.ingestion.model;

public class NormalizedFields {
    private String name;
    private String nameForMatch;
    private String mobile;
    private String email;
    private String dob;
    private String pan;
    private String city;

    public NormalizedFields() {}

    public NormalizedFields(String name, String nameForMatch, String mobile, String email, String dob, String pan, String city) {
        this.name = name;
        this.nameForMatch = nameForMatch;
        this.mobile = mobile;
        this.email = email;
        this.dob = dob;
        this.pan = pan;
        this.city = city;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String nameForMatch;
        private String mobile;
        private String email;
        private String dob;
        private String pan;
        private String city;

        public Builder name(String name) { this.name = name; return this; }
        public Builder nameForMatch(String nameForMatch) { this.nameForMatch = nameForMatch; return this; }
        public Builder mobile(String mobile) { this.mobile = mobile; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder dob(String dob) { this.dob = dob; return this; }
        public Builder pan(String pan) { this.pan = pan; return this; }
        public Builder city(String city) { this.city = city; return this; }

        public NormalizedFields build() {
            return new NormalizedFields(name, nameForMatch, mobile, email, dob, pan, city);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNameForMatch() { return nameForMatch; }
    public void setNameForMatch(String nameForMatch) { this.nameForMatch = nameForMatch; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
