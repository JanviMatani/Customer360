package com.ps04.customer360.audit;

import com.ps04.customer360.audit.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuditLogRepo extends MongoRepository<AuditLog, String> {
    Page<AuditLog> findByAction(String action, Pageable pageable);
    Page<AuditLog> findByActorId(String actorId, Pageable pageable);
    Page<AuditLog> findByTargetId(String targetId, Pageable pageable);
}
