package com.ps04.customer360.auth.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private String rmId;
    private long expiresInMs;

    public LoginResponse() {}

    public LoginResponse(String token, String email, String role, String rmId, long expiresInMs) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.rmId = rmId;
        this.expiresInMs = expiresInMs;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private String email;
        private String role;
        private String rmId;
        private long expiresInMs;

        public Builder token(String token) { this.token = token; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder rmId(String rmId) { this.rmId = rmId; return this; }
        public Builder expiresInMs(long expiresInMs) { this.expiresInMs = expiresInMs; return this; }

        public LoginResponse build() {
            return new LoginResponse(token, email, role, rmId, expiresInMs);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRmId() { return rmId; }
    public void setRmId(String rmId) { this.rmId = rmId; }

    public long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(long expiresInMs) { this.expiresInMs = expiresInMs; }
}
