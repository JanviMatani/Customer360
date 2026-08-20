package com.ps04.customer360.opportunity;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.common.dto.PageResponse;
import com.ps04.customer360.common.exception.ForbiddenException;
import com.ps04.customer360.common.exception.NotFoundException;
import com.ps04.customer360.opportunity.model.Opportunity;
import com.ps04.customer360.security.AppPrincipal;
import com.ps04.customer360.security.Audited;
import com.ps04.customer360.security.DataScopeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {

    private final OpportunityRepo opportunityRepo;
    private final DataScopeService dataScopeService;
    private final AuditService auditService;

    public OpportunityController(OpportunityRepo opportunityRepo,
                                 DataScopeService dataScopeService,
                                 AuditService auditService) {
        this.opportunityRepo = opportunityRepo;
        this.dataScopeService = dataScopeService;
        this.auditService = auditService;
    }

    public static class StatusUpdateRequest {
        private String status;

        public StatusUpdateRequest() {}

        public StatusUpdateRequest(String status) {
            this.status = status;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @GetMapping
    public ResponseEntity<PageResponse<Opportunity>> listOpportunities(
            @AuthenticationPrincipal AppPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String product,
            @RequestParam(defaultValue = "score,desc") String sort) {

        if (pageSize <= 0 || page < 0) {
            throw new IllegalArgumentException("Invalid pagination parameters");
        }

        Sort sortOrder = parseSort(sort);
        Pageable pageable = PageRequest.of(page, pageSize, sortOrder);
        Page<Opportunity> result;

        if ("admin".equalsIgnoreCase(principal.role())) {
            if (product != null && !product.isBlank()) {
                result = opportunityRepo.findByProduct(product.toLowerCase(), pageable);
            } else {
                result = opportunityRepo.findAll(pageable);
            }
        } else {
            List<String> visibleRmIds = dataScopeService.visibleRmIds(principal);
            if (product != null && !product.isBlank()) {
                // filter by rmId and product
                result = opportunityRepo.findByRmIdAndProduct(visibleRmIds.get(0), product.toLowerCase(), pageable);
            } else {
                result = opportunityRepo.findByRmIdIn(visibleRmIds, pageable);
            }
        }

        return ResponseEntity.ok(PageResponse.from(result));
    }

    @PatchMapping("/{id}/status")
    @Audited(action = "OPPORTUNITY_STATUS_CHANGE", targetType = "opportunity")
    public ResponseEntity<Opportunity> updateStatus(
            @AuthenticationPrincipal AppPrincipal principal,
            @PathVariable String id,
            @RequestBody StatusUpdateRequest req) {

        if (req == null || req.getStatus() == null || req.getStatus().isBlank()) {
            throw new IllegalArgumentException("Status field is required");
        }

        Opportunity opp = opportunityRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Opportunity not found: " + id));

        if (!dataScopeService.canAccess(principal, opp.getRmId())) {
            throw new ForbiddenException("Access denied to opportunity " + id + " owned by " + opp.getRmId());
        }

        String newStatus = req.getStatus().toLowerCase();
        String currentStatus = opp.getStatus();

        // Validate state transitions
        if ("converted".equalsIgnoreCase(currentStatus) && "new".equalsIgnoreCase(newStatus)) {
            throw new IllegalArgumentException("Invalid status transition: converted cannot revert to new");
        }
        if (!List.of("new", "in_progress", "converted", "dismissed").contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        opp.setStatus(newStatus);
        opp.setUpdatedAt(Instant.now());
        opportunityRepo.save(opp);

        auditService.log(principal.email(), principal.role(), "OPPORTUNITY_STATUS_CHANGE",
                "opportunity", id, "Updated status of opportunity " + id + " from " + currentStatus + " to " + newStatus);

        return ResponseEntity.ok(opp);
    }

    private Sort parseSort(String sortParam) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by("score").descending();
        }
        String[] parts = sortParam.split(",");
        String prop = parts[0].trim();
        Sort.Direction dir = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Allow-list sortable fields to prevent injection
        if (!List.of("score", "potentialValue", "generatedAt", "customerName", "product").contains(prop)) {
            prop = "score";
        }
        return Sort.by(dir, prop);
    }
}
