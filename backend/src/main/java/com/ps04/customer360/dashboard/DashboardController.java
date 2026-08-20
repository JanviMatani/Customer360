package com.ps04.customer360.dashboard;

import com.ps04.customer360.golden.GoldenCustomerRepo;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.ingestion.RawEquityRepo;
import com.ps04.customer360.ingestion.RawInsuranceRepo;
import com.ps04.customer360.ingestion.RawLoanRepo;
import com.ps04.customer360.ingestion.RawMfRepo;
import com.ps04.customer360.ingestion.RawWealthRepo;
import com.ps04.customer360.opportunity.OpportunityRepo;
import com.ps04.customer360.review.ConflictQueueRepo;
import com.ps04.customer360.security.AppPrincipal;
import com.ps04.customer360.security.DataScopeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final GoldenCustomerRepo goldenRepo;
    private final OpportunityRepo opportunityRepo;
    private final ConflictQueueRepo conflictRepo;
    private final RawEquityRepo equityRepo;
    private final RawMfRepo mfRepo;
    private final RawInsuranceRepo insuranceRepo;
    private final RawLoanRepo loanRepo;
    private final RawWealthRepo wealthRepo;
    private final DataScopeService dataScopeService;

    public DashboardController(GoldenCustomerRepo goldenRepo, OpportunityRepo opportunityRepo,
                               ConflictQueueRepo conflictRepo, RawEquityRepo equityRepo,
                               RawMfRepo mfRepo, RawInsuranceRepo insuranceRepo,
                               RawLoanRepo loanRepo, RawWealthRepo wealthRepo,
                               DataScopeService dataScopeService) {
        this.goldenRepo = goldenRepo;
        this.opportunityRepo = opportunityRepo;
        this.conflictRepo = conflictRepo;
        this.equityRepo = equityRepo;
        this.mfRepo = mfRepo;
        this.insuranceRepo = insuranceRepo;
        this.loanRepo = loanRepo;
        this.wealthRepo = wealthRepo;
        this.dataScopeService = dataScopeService;
    }

    public static class DashboardStatsResponse {
        private String role;
        private long totalCustomers;
        private Double totalRelationshipValue;
        private long newOpportunities;
        private long inProgressOpportunities;
        private long convertedOpportunities;
        private Long ingestedRawRows;
        private Long autoMergedCount;
        private Long pendingReviewCount;
        private Long dangerousConflictsCount;

        public DashboardStatsResponse() {}

        public DashboardStatsResponse(String role, long totalCustomers, Double totalRelationshipValue, long newOpportunities, long inProgressOpportunities, long convertedOpportunities, Long ingestedRawRows, Long autoMergedCount, Long pendingReviewCount, Long dangerousConflictsCount) {
            this.role = role;
            this.totalCustomers = totalCustomers;
            this.totalRelationshipValue = totalRelationshipValue;
            this.newOpportunities = newOpportunities;
            this.inProgressOpportunities = inProgressOpportunities;
            this.convertedOpportunities = convertedOpportunities;
            this.ingestedRawRows = ingestedRawRows;
            this.autoMergedCount = autoMergedCount;
            this.pendingReviewCount = pendingReviewCount;
            this.dangerousConflictsCount = dangerousConflictsCount;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String role;
            private long totalCustomers;
            private Double totalRelationshipValue;
            private long newOpportunities;
            private long inProgressOpportunities;
            private long convertedOpportunities;
            private Long ingestedRawRows;
            private Long autoMergedCount;
            private Long pendingReviewCount;
            private Long dangerousConflictsCount;

            public Builder role(String role) { this.role = role; return this; }
            public Builder totalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; return this; }
            public Builder totalRelationshipValue(Double totalRelationshipValue) { this.totalRelationshipValue = totalRelationshipValue; return this; }
            public Builder newOpportunities(long newOpportunities) { this.newOpportunities = newOpportunities; return this; }
            public Builder inProgressOpportunities(long inProgressOpportunities) { this.inProgressOpportunities = inProgressOpportunities; return this; }
            public Builder convertedOpportunities(long convertedOpportunities) { this.convertedOpportunities = convertedOpportunities; return this; }
            public Builder ingestedRawRows(Long ingestedRawRows) { this.ingestedRawRows = ingestedRawRows; return this; }
            public Builder autoMergedCount(Long autoMergedCount) { this.autoMergedCount = autoMergedCount; return this; }
            public Builder pendingReviewCount(Long pendingReviewCount) { this.pendingReviewCount = pendingReviewCount; return this; }
            public Builder dangerousConflictsCount(Long dangerousConflictsCount) { this.dangerousConflictsCount = dangerousConflictsCount; return this; }

            public DashboardStatsResponse build() {
                return new DashboardStatsResponse(role, totalCustomers, totalRelationshipValue, newOpportunities, inProgressOpportunities, convertedOpportunities, ingestedRawRows, autoMergedCount, pendingReviewCount, dangerousConflictsCount);
            }
        }

        public String getRole() { return role; }
        public long getTotalCustomers() { return totalCustomers; }
        public Double getTotalRelationshipValue() { return totalRelationshipValue; }
        public long getNewOpportunities() { return newOpportunities; }
        public long getInProgressOpportunities() { return inProgressOpportunities; }
        public long getConvertedOpportunities() { return convertedOpportunities; }
        public Long getIngestedRawRows() { return ingestedRawRows; }
        public Long getAutoMergedCount() { return autoMergedCount; }
        public Long getPendingReviewCount() { return pendingReviewCount; }
        public Long getDangerousConflictsCount() { return dangerousConflictsCount; }
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(@AuthenticationPrincipal AppPrincipal principal) {
        DashboardStatsResponse.Builder builder = DashboardStatsResponse.builder()
                .role(principal.role());

        if ("admin".equalsIgnoreCase(principal.role())) {
            long rawCount = equityRepo.count() + mfRepo.count() + insuranceRepo.count() + loanRepo.count() + wealthRepo.count();
            long totalGolden = goldenRepo.count();
            long pendingReview = conflictRepo.findByStatus("PENDING").size();
            long dangerous = conflictRepo.findByStatus("PENDING").stream().filter(c -> c.isDangerousConflict()).count();

            List<GoldenCustomer> allGolden = goldenRepo.findAll();
            double totalVal = allGolden.stream()
                    .mapToDouble(g -> g.getTotalRelationshipValue() != null ? g.getTotalRelationshipValue() : 0.0)
                    .sum();

            builder.totalCustomers(totalGolden)
                   .totalRelationshipValue(totalVal)
                   .ingestedRawRows(rawCount)
                   .autoMergedCount(totalGolden)
                   .pendingReviewCount(pendingReview)
                   .dangerousConflictsCount(dangerous)
                   .newOpportunities(opportunityRepo.countByStatus("new"))
                   .inProgressOpportunities(opportunityRepo.countByStatus("in_progress"))
                   .convertedOpportunities(opportunityRepo.countByStatus("converted"));
        } else {
            List<String> visibleRmIds = dataScopeService.visibleRmIds(principal);
            long customerCount = goldenRepo.countByRmIdIn(visibleRmIds);

            List<GoldenCustomer> customers = goldenRepo.findByRmIdIn(visibleRmIds);
            double totalVal = customers.stream()
                    .mapToDouble(g -> g.getTotalRelationshipValue() != null ? g.getTotalRelationshipValue() : 0.0)
                    .sum();

            builder.totalCustomers(customerCount)
                   .totalRelationshipValue(totalVal)
                   .newOpportunities(opportunityRepo.countByRmIdInAndStatus(visibleRmIds, "new"))
                   .inProgressOpportunities(opportunityRepo.countByRmIdInAndStatus(visibleRmIds, "in_progress"))
                   .convertedOpportunities(opportunityRepo.countByRmIdInAndStatus(visibleRmIds, "converted"));
        }

        return ResponseEntity.ok(builder.build());
    }
}
