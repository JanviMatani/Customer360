package com.ps04.customer360.audit.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "audit_log")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private Instant timestamp;

    private String actorId;
    private String actorRole;

    @Indexed
    private String action;

    private String targetType;
    private String targetId;

    private Map<String, Object> before;
    private Map<String, Object> after;

    private String ip;
    private String description;

    public AuditLog() {}

    public AuditLog(String id, Instant timestamp, String actorId, String actorRole, String action, String targetType, String targetId, Map<String, Object> before, Map<String, Object> after, String ip, String description) {
        this.id = id;
        this.timestamp = timestamp;
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.before = before;
        this.after = after;
        this.ip = ip;
        this.description = description;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private Instant timestamp;
        private String actorId;
        private String actorRole;
        private String action;
        private String targetType;
        private String targetId;
        private Map<String, Object> before;
        private Map<String, Object> after;
        private String ip;
        private String description;

        public Builder id(String id) { this.id = id; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder actorId(String actorId) { this.actorId = actorId; return this; }
        public Builder actorRole(String actorRole) { this.actorRole = actorRole; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder targetType(String targetType) { this.targetType = targetType; return this; }
        public Builder targetId(String targetId) { this.targetId = targetId; return this; }
        public Builder before(Map<String, Object> before) { this.before = before; return this; }
        public Builder after(Map<String, Object> after) { this.after = after; return this; }
        public Builder ip(String ip) { this.ip = ip; return this; }
        public Builder description(String description) { this.description = description; return this; }

        public AuditLog build() {
            return new AuditLog(id, timestamp, actorId, actorRole, action, targetType, targetId, before, after, ip, description);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public Map<String, Object> getBefore() { return before; }
    public void setBefore(Map<String, Object> before) { this.before = before; }

    public Map<String, Object> getAfter() { return after; }
    public void setAfter(Map<String, Object> after) { this.after = after; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
