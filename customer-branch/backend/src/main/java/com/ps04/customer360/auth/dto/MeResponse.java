package com.ps04.customer360.auth.dto;

import java.util.List;

public class MeResponse {
    private String email;
    private String role;
    private String rmId;
    private List<String> managerOf;

    public MeResponse() {}

    public MeResponse(String email, String role, String rmId, List<String> managerOf) {
        this.email = email;
        this.role = role;
        this.rmId = rmId;
        this.managerOf = managerOf;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String email;
        private String role;
        private String rmId;
        private List<String> managerOf;

        public Builder email(String email) { this.email = email; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder rmId(String rmId) { this.rmId = rmId; return this; }
        public Builder managerOf(List<String> managerOf) { this.managerOf = managerOf; return this; }

        public MeResponse build() {
            return new MeResponse(email, role, rmId, managerOf);
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRmId() { return rmId; }
    public void setRmId(String rmId) { this.rmId = rmId; }

    public List<String> getManagerOf() { return managerOf; }
    public void setManagerOf(List<String> managerOf) { this.managerOf = managerOf; }
}
