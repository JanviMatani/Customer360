package com.ps04.customer360.config_rules;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.common.exception.ForbiddenException;
import com.ps04.customer360.security.AppPrincipal;
import com.ps04.customer360.security.Audited;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final ConfigService configService;
    private final AuditService auditService;

    public ConfigController(ConfigService configService, AuditService auditService) {
        this.configService = configService;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = configService.getMatchWeights();
        return ResponseEntity.ok(config);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Audited(action = "CONFIG_UPDATE", targetType = "config")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @AuthenticationPrincipal AppPrincipal principal,
            @RequestBody Map<String, Object> newConfig) {

        validateConfig(newConfig);

        Map<String, Object> before = configService.getMatchWeights();
        Map<String, Object> updated = configService.updateMatchWeights(newConfig, principal.email());

        auditService.log(principal.email(), principal.role(), "CONFIG_UPDATE",
                "config", "match-weights-v1", before, updated, null,
                "Updated match weights and thresholds");

        return ResponseEntity.ok(updated);
    }

    @SuppressWarnings("unchecked")
    private void validateConfig(Map<String, Object> config) {
        if (config.containsKey("weights") && config.get("weights") instanceof Map<?, ?> weightsMap) {
            int sum = 0;
            for (Object v : weightsMap.values()) {
                if (v instanceof Number n) {
                    sum += n.intValue();
                }
            }
            if (sum != 100) {
                throw new IllegalArgumentException("Match weights must sum to exactly 100 (got " + sum + ")");
            }
        }

        if (config.containsKey("autoMergeThreshold") && config.containsKey("manualReviewLowerThreshold")) {
            int autoMerge = ((Number) config.get("autoMergeThreshold")).intValue();
            int reviewLower = ((Number) config.get("manualReviewLowerThreshold")).intValue();

            if (reviewLower >= autoMerge) {
                throw new IllegalArgumentException("manualReviewLowerThreshold (" + reviewLower
                        + ") must be strictly less than autoMergeThreshold (" + autoMerge + ")");
            }
        }
    }
}
