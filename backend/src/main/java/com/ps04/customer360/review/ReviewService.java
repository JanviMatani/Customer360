package com.ps04.customer360.review;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.common.exception.ConflictException;
import com.ps04.customer360.common.exception.NotFoundException;
import com.ps04.customer360.golden.GoldenCustomerService;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.ingestion.RawEquityRepo;
import com.ps04.customer360.ingestion.RawInsuranceRepo;
import com.ps04.customer360.ingestion.RawLoanRepo;
import com.ps04.customer360.ingestion.RawMfRepo;
import com.ps04.customer360.ingestion.RawWealthRepo;
import com.ps04.customer360.matching.CandidateGenerationService.SourceRecordRef;
import com.ps04.customer360.matching.model.MatchResult;
import com.ps04.customer360.review.model.ConflictQueueItem;
import com.ps04.customer360.security.AppPrincipal;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ConflictQueueRepo conflictRepo;
    private final GoldenCustomerService goldenCustomerService;
    private final AuditService auditService;
    private final RawEquityRepo equityRepo;
    private final RawMfRepo mfRepo;
    private final RawInsuranceRepo insuranceRepo;
    private final RawLoanRepo loanRepo;
    private final RawWealthRepo wealthRepo;

    public ReviewService(ConflictQueueRepo conflictRepo,
                         GoldenCustomerService goldenCustomerService,
                         AuditService auditService,
                         RawEquityRepo equityRepo, RawMfRepo mfRepo,
                         RawInsuranceRepo insuranceRepo, RawLoanRepo loanRepo,
                         RawWealthRepo wealthRepo) {
        this.conflictRepo = conflictRepo;
        this.goldenCustomerService = goldenCustomerService;
        this.auditService = auditService;
        this.equityRepo = equityRepo;
        this.mfRepo = mfRepo;
        this.insuranceRepo = insuranceRepo;
        this.loanRepo = loanRepo;
        this.wealthRepo = wealthRepo;
    }

    public static class DecisionRequest {
        private String decision;
        private String note;

        public DecisionRequest() {}

        public DecisionRequest(String decision, String note) {
            this.decision = decision;
            this.note = note;
        }

        public String getDecision() { return decision; }
        public void setDecision(String decision) { this.decision = decision; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public List<ConflictQueueItem> getQueue(String status) {
        String filterStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "PENDING";
        return conflictRepo.findByStatusOrderByCreatedAtDesc(filterStatus);
    }

    public ConflictQueueItem decide(String conflictId, DecisionRequest req, AppPrincipal principal) {
        if (req == null || req.getDecision() == null || req.getDecision().isBlank()) {
            throw new IllegalArgumentException("Decision field is required");
        }

        ConflictQueueItem item = conflictRepo.findById(conflictId)
                .orElseThrow(() -> new NotFoundException("Conflict item not found: " + conflictId));

        if (!"PENDING".equalsIgnoreCase(item.getStatus())) {
            throw new ConflictException("Conflict item " + conflictId + " is already decided (" + item.getStatus() + ")");
        }

        String decision = req.getDecision().toUpperCase();
        item.setDecidedBy(principal.email());
        item.setDecidedAt(Instant.now());
        item.setNote(req.getNote());

        if ("MERGE".equals(decision)) {
            item.setStatus("APPROVED");
            conflictRepo.save(item);

            SourceRecordRef recA = fetchSourceRef(item.getRecordA().getSourceSystem(), item.getRecordA().getSourceCustomerId());
            SourceRecordRef recB = fetchSourceRef(item.getRecordB().getSourceSystem(), item.getRecordB().getSourceCustomerId());

            if (recA != null && recB != null) {
                MatchResult mr = MatchResult.builder()
                        .confidenceScore(item.getConfidence())
                        .evidence(item.getEvidence())
                        .build();

                goldenCustomerService.mergeRecords(List.of(recA, recB), mr, "MANUAL", item.getConfidence(), principal.email());
            }

            auditService.log(principal.email(), principal.role(), "MERGE_APPROVED",
                    "conflict", conflictId, "Manual merge approved for conflict " + conflictId);

        } else if ("SEPARATE".equals(decision)) {
            item.setStatus("REJECTED");
            conflictRepo.save(item);

            auditService.log(principal.email(), principal.role(), "MERGE_REJECTED",
                    "conflict", conflictId, "Manual merge rejected (separated) for conflict " + conflictId);
        } else {
            throw new IllegalArgumentException("Invalid decision value: " + req.getDecision() + ". Must be MERGE or SEPARATE.");
        }

        return item;
    }

    private SourceRecordRef fetchSourceRef(String sys, String cid) {
        return switch (sys.toUpperCase()) {
            case "EQUITY" -> equityRepo.findAll().stream().filter(r -> cid.equals(r.getSourceCustomerId())).findFirst()
                    .map(r -> new SourceRecordRef("EQUITY", cid, r.getNormalized(), r.getRaw())).orElse(null);
            case "MF" -> mfRepo.findAll().stream().filter(r -> cid.equals(r.getSourceCustomerId())).findFirst()
                    .map(r -> new SourceRecordRef("MF", cid, r.getNormalized(), r.getRaw())).orElse(null);
            case "INSURANCE" -> insuranceRepo.findAll().stream().filter(r -> cid.equals(r.getSourceCustomerId())).findFirst()
                    .map(r -> new SourceRecordRef("INSURANCE", cid, r.getNormalized(), r.getRaw())).orElse(null);
            case "LOANS" -> loanRepo.findAll().stream().filter(r -> cid.equals(r.getSourceCustomerId())).findFirst()
                    .map(r -> new SourceRecordRef("LOANS", cid, r.getNormalized(), r.getRaw())).orElse(null);
            case "WEALTH" -> wealthRepo.findAll().stream().filter(r -> cid.equals(r.getSourceCustomerId())).findFirst()
                    .map(r -> new SourceRecordRef("WEALTH", cid, r.getNormalized(), r.getRaw())).orElse(null);
            default -> null;
        };
    }
}
