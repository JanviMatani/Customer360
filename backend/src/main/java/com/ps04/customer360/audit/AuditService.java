package com.ps04.customer360.audit;

import com.ps04.customer360.audit.model.AuditLog;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuditService {

    private final AuditLogRepo auditLogRepo;

    public AuditService(AuditLogRepo auditLogRepo) {
        this.auditLogRepo = auditLogRepo;
    }

    public void log(String actorId, String actorRole, String action,
                    String targetType, String targetId,
                    Map<String, Object> before, Map<String, Object> after,
                    String ip, String description) {
        AuditLog entry = AuditLog.builder()
                .timestamp(Instant.now())
                .actorId(actorId)
                .actorRole(actorRole)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .before(before)
                .after(after)
                .ip(ip)
                .description(description)
                .build();
        auditLogRepo.save(entry);
    }

    public void log(String actorId, String actorRole, String action,
                    String targetType, String targetId, String description) {
        log(actorId, actorRole, action, targetType, targetId, null, null, null, description);
    }
}
