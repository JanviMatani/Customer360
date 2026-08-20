package com.ps04.customer360.customer360;

import com.ps04.customer360.common.MaskingService;
import com.ps04.customer360.common.dto.PageResponse;
import com.ps04.customer360.common.exception.ForbiddenException;
import com.ps04.customer360.customer360.Customer360Service.Customer360Response;
import com.ps04.customer360.golden.GoldenCustomerRepo;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.opportunity.OpportunityRepo;
import com.ps04.customer360.opportunity.model.Opportunity;
import com.ps04.customer360.security.AppPrincipal;
import com.ps04.customer360.security.DataScopeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final GoldenCustomerRepo goldenRepo;
    private final Customer360Service customer360Service;
    private final OpportunityRepo opportunityRepo;
    private final DataScopeService dataScopeService;
    private final MaskingService maskingService;

    public CustomerController(GoldenCustomerRepo goldenRepo,
                              Customer360Service customer360Service,
                              OpportunityRepo opportunityRepo,
                              DataScopeService dataScopeService,
                              MaskingService maskingService) {
        this.goldenRepo = goldenRepo;
        this.customer360Service = customer360Service;
        this.opportunityRepo = opportunityRepo;
        this.dataScopeService = dataScopeService;
        this.maskingService = maskingService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<GoldenCustomer>> getCustomers(
            @AuthenticationPrincipal AppPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String city) {

        if (pageSize <= 0 || page < 0) {
            throw new IllegalArgumentException("Invalid pagination parameters");
        }

        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
        Page<GoldenCustomer> result;

        if ("admin".equalsIgnoreCase(principal.role())) {
            if (city != null && !city.isBlank()) {
                result = goldenRepo.findByCityIgnoreCase(city, pageable);
            } else {
                result = goldenRepo.findAll(pageable);
            }
        } else {
            List<String> visibleRmIds = dataScopeService.visibleRmIds(principal);
            result = goldenRepo.findByRmIdIn(visibleRmIds, pageable);
        }

        // Mask PAN & Mobile in summary list
        result.getContent().forEach(c -> {
            c.setPrimaryPan(maskingService.maskPan(c.getPrimaryPan()));
            c.setPrimaryMobile(maskingService.maskMobile(c.getPrimaryMobile()));
        });

        return ResponseEntity.ok(PageResponse.from(result));
    }

    @GetMapping("/{goldenId}")
    public ResponseEntity<Customer360Response> getCustomerById(
            @AuthenticationPrincipal AppPrincipal principal,
            @PathVariable String goldenId) {

        GoldenCustomer customer = goldenRepo.findById(goldenId)
                .orElseThrow(() -> new com.ps04.customer360.common.exception.NotFoundException("Golden customer not found: " + goldenId));

        if (!dataScopeService.canAccess(principal, customer.getRmId())) {
            throw new ForbiddenException("Access denied to customer " + goldenId + " owned by " + customer.getRmId());
        }

        Customer360Response response = customer360Service.getCustomer360(goldenId, true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{goldenId}/opportunities")
    public ResponseEntity<List<Opportunity>> getOpportunitiesByCustomer(
            @AuthenticationPrincipal AppPrincipal principal,
            @PathVariable String goldenId) {

        GoldenCustomer customer = goldenRepo.findById(goldenId)
                .orElseThrow(() -> new com.ps04.customer360.common.exception.NotFoundException("Golden customer not found: " + goldenId));

        if (!dataScopeService.canAccess(principal, customer.getRmId())) {
            throw new ForbiddenException("Access denied to opportunities for customer " + goldenId);
        }

        List<Opportunity> opps = opportunityRepo.findByGoldenId(goldenId);
        return ResponseEntity.ok(opps);
    }
}
