package com.ps04.customer360.auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private String role;
    private String rmId;
    private List<String> managerOf;

    private int failedLoginAttempts;
    private Instant lockedUntil;

    public User() {}

    public User(String id, String email, String passwordHash, String role, String rmId, List<String> managerOf, int failedLoginAttempts, Instant lockedUntil) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.rmId = rmId;
        this.managerOf = managerOf;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockedUntil = lockedUntil;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String email;
        private String passwordHash;
        private String role;
        private String rmId;
        private List<String> managerOf;
        private int failedLoginAttempts;
        private Instant lockedUntil;

        public Builder id(String id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder rmId(String rmId) { this.rmId = rmId; return this; }
        public Builder managerOf(List<String> managerOf) { this.managerOf = managerOf; return this; }
        public Builder failedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; return this; }
        public Builder lockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; return this; }

        public User build() {
            return new User(id, email, passwordHash, role, rmId, managerOf, failedLoginAttempts, lockedUntil);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRmId() { return rmId; }
    public void setRmId(String rmId) { this.rmId = rmId; }

    public List<String> getManagerOf() { return managerOf; }
    public void setManagerOf(List<String> managerOf) { this.managerOf = managerOf; }

    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public Instant getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; }
}
