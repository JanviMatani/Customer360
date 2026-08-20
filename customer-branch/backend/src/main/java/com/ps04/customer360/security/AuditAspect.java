package com.ps04.customer360.security;

import com.ps04.customer360.audit.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * AuditAspect — automatically logs every privileged mutating action.
 *
 * Applies to all controller methods annotated with @Audited.
 * This is a cross-cutting concern so individual services don't have to remember
 * to call AuditService manually — reduces the risk of an unaudited privileged action.
 *
 * Individual services still call AuditService directly for more fine-grained logging
 * (e.g., capturing before/after config values). This aspect handles the baseline
 * "action happened" audit entry.
 */
@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditService auditService;

    public AuditAspect(AuditService auditService) {
        this.auditService = auditService;
    }

    @Around("@annotation(audited)")
    public Object auditAction(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actorId   = "anonymous";
        String actorRole = "unknown";

        if (auth != null && auth.getPrincipal() instanceof AppPrincipal principal) {
            actorId   = principal.email();
            actorRole = principal.role();
        }

        String ip = getClientIp();

        try {
            Object result = pjp.proceed();
            auditService.log(actorId, actorRole, audited.action(),
                    audited.targetType(), null, null, null, ip,
                    pjp.getSignature().toShortString());
            return result;
        } catch (Exception e) {
            log.error("Audited action {} failed: {}", audited.action(), e.getMessage());
            throw e;
        }
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                String forwarded = req.getHeader("X-Forwarded-For");
                return forwarded != null ? forwarded.split(",")[0] : req.getRemoteAddr();
            }
        } catch (Exception ignored) {}
        return "unknown";
    }
}
