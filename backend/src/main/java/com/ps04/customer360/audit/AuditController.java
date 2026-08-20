package com.ps04.customer360.audit;

import com.ps04.customer360.audit.model.AuditLog;
import com.ps04.customer360.common.dto.PageResponse;
import com.ps04.customer360.common.exception.ForbiddenException;
import com.ps04.customer360.security.AppPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepo auditRepo;

    public AuditController(AuditLogRepo auditRepo) {
        this.auditRepo = auditRepo;
    }

    @GetMapping
    public ResponseEntity<PageResponse<AuditLog>> getAuditLog(
            @AuthenticationPrincipal AppPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String targetId) {

        if (!"admin".equalsIgnoreCase(principal.role())) {
            throw new ForbiddenException("Access to audit logs is restricted to ADMIN role");
        }

        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("timestamp").descending());
        Page<AuditLog> result;

        if (action != null && !action.isBlank()) {
            result = auditRepo.findByAction(action, pageable);
        } else if (actorId != null && !actorId.isBlank()) {
            result = auditRepo.findByActorId(actorId, pageable);
        } else if (targetId != null && !targetId.isBlank()) {
            result = auditRepo.findByTargetId(targetId, pageable);
        } else {
            result = auditRepo.findAll(pageable);
        }

        return ResponseEntity.ok(PageResponse.from(result));
    }
}
