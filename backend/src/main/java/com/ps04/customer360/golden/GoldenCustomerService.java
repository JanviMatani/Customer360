package com.ps04.customer360.golden;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.golden.model.AttributeConflict;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.golden.model.GoldenCustomerLink;
import com.ps04.customer360.ingestion.model.NormalizedFields;
import com.ps04.customer360.matching.CandidateGenerationService.SourceRecordRef;
import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.MatchDecision;
import com.ps04.customer360.matching.model.MatchResult;
import com.ps04.customer360.review.ConflictQueueRepo;
import com.ps04.customer360.review.model.ConflictQueueItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GoldenCustomerService {

    private static final Logger log = LoggerFactory.getLogger(GoldenCustomerService.class);

    private final GoldenCustomerRepo goldenCustomerRepo;
    private final GoldenCustomerLinkRepo goldenLinkRepo;
    private final ConflictQueueRepo conflictQueueRepo;
    private final AuditService auditService;

    @Value("${app.source-precedence:EQUITY,WEALTH,MF,INSURANCE,LOANS}")
    private List<String> sourcePrecedence;

    private static final AtomicInteger idCounter = new AtomicInteger(1);

    public GoldenCustomerService(GoldenCustomerRepo goldenCustomerRepo,
                                 GoldenCustomerLinkRepo goldenLinkRepo,
                                 ConflictQueueRepo conflictQueueRepo,
                                 AuditService auditService) {
        this.goldenCustomerRepo = goldenCustomerRepo;
        this.goldenLinkRepo = goldenLinkRepo;
        this.conflictQueueRepo = conflictQueueRepo;
        this.auditService = auditService;
    }

    /**
     * Process a pair match decision (AUTO_MERGE, MANUAL_REVIEW, SEPARATE).
     */
    public void processPairDecision(SourceRecordRef recA, SourceRecordRef recB,
                                    MatchResult matchResult, MatchDecision decision) {

        if (decision == MatchDecision.AUTO_MERGE) {
            mergeRecords(List.of(recA, recB), matchResult, "DETERMINISTIC", 
                         matchResult.getConfidenceScore(), "system");
        } else if (decision == MatchDecision.MANUAL_REVIEW) {
            queueForReview(recA, recB, matchResult);
        } else {
            log.debug("Pair {},{} separated.", recA.sourceCustomerId(), recB.sourceCustomerId());
        }
    }

    /**
     * Creates or updates a GoldenCustomer from a set of source records.
     */
    public GoldenCustomer mergeRecords(List<SourceRecordRef> records,
                                      MatchResult matchResult,
                                      String matchMethod,
                                      int confidence,
                                      String approvedBy) {
        // Look up if any of these records are already linked to an existing Golden Customer
        GoldenCustomer existing = null;
        for (SourceRecordRef r : records) {
            List<GoldenCustomerLink> links = goldenLinkRepo
                    .findBySourceSystemAndSourceCustomerId(r.sourceSystem(), r.sourceCustomerId());
            if (!links.isEmpty()) {
                Optional<GoldenCustomer> gOpt = goldenCustomerRepo.findById(links.get(0).getGoldenId());
                if (gOpt.isPresent()) {
                    existing = gOpt.get();
                    break;
                }
            }
        }

        // Also try matching by primary PAN if available
        if (existing == null) {
            for (SourceRecordRef r : records) {
                if (r.normalized() != null && r.normalized().getPan() != null) {
                    Optional<GoldenCustomer> panOpt = goldenCustomerRepo.findByPrimaryPan(r.normalized().getPan());
                    if (panOpt.isPresent()) {
                        existing = panOpt.get();
                        break;
                    }
                }
            }
        }

        String goldenId = (existing != null) ? existing.getId() : generateGoldenId();

        // Determine primary attributes and conflicts via source precedence
        ResolvedAttributes resolved = resolveAttributes(records);

        GoldenCustomer golden = GoldenCustomer.builder()
                .id(goldenId)
                .name(resolved.primaryName)
                .dob(resolved.primaryDob)
                .city(resolved.primaryCity)
                .segment(resolved.primarySegment)
                .primaryPan(resolved.primaryPan)
                .primaryMobile(resolved.primaryMobile)
                .primaryEmail(resolved.primaryEmail)
                .linkedSources(resolved.linkedSources)
                .matchConfidence(confidence)
                .totalRelationshipValue(calculateTotalRelationshipValue(records))
                .attributeConflicts(resolved.attributeConflicts)
                .rmId(resolved.assignedRmId)
                .createdAt(existing != null ? existing.getCreatedAt() : Instant.now())
                .updatedAt(Instant.now())
                .createdBy(existing != null ? existing.getCreatedBy() : approvedBy)
                .version(existing != null ? existing.getVersion() : null)
                .build();

        goldenCustomerRepo.save(golden);

        // Save links for all records
        for (SourceRecordRef r : records) {
            if (!goldenLinkRepo.existsByGoldenIdAndSourceSystemAndSourceCustomerId(
                    goldenId, r.sourceSystem(), r.sourceCustomerId())) {

                GoldenCustomerLink link = GoldenCustomerLink.builder()
                        .goldenId(goldenId)
                        .sourceSystem(r.sourceSystem())
                        .sourceCustomerId(r.sourceCustomerId())
                        .matchMethod(matchMethod)
                        .matchConfidence(confidence)
                        .evidence(matchResult != null ? matchResult.getEvidence() : List.of())
                        .linkedAt(Instant.now())
                        .approvedBy("system".equals(approvedBy) ? null : approvedBy)
                        .build();
                goldenLinkRepo.save(link);
            }
        }

        auditService.log(
                approvedBy,
                "system".equals(approvedBy) ? "system" : "manager",
                existing != null ? "MERGE_UPDATED" : "MERGE_APPROVED",
                "golden_customer",
                goldenId,
                "Created/Updated golden customer " + goldenId + " with sources: " + resolved.linkedSources
        );

        return golden;
    }

    /**
     * Queues a pair to the conflict_queue collection for manual review.
     */
    private void queueForReview(SourceRecordRef recA, SourceRecordRef recB, MatchResult matchResult) {
        boolean exists = conflictQueueRepo.existsByRecordASourceCustomerIdAndRecordBSourceCustomerIdAndStatus(
                recA.sourceCustomerId(), recB.sourceCustomerId(), "PENDING");
        if (exists) return;

        ConflictQueueItem item = ConflictQueueItem.builder()
                .status("PENDING")
                .recordA(new ConflictQueueItem.SourceRef(recA.sourceSystem(), recA.sourceCustomerId()))
                .recordB(new ConflictQueueItem.SourceRef(recB.sourceSystem(), recB.sourceCustomerId()))
                .confidence(matchResult.getConfidenceScore())
                .evidence(matchResult.getEvidence())
                .isDangerousConflict(matchResult.isDangerousConflict())
                .dangerReason(matchResult.getHardConflictReason())
                .createdAt(Instant.now())
                .build();

        conflictQueueRepo.save(item);
    }

    private synchronized String generateGoldenId() {
        return String.format("CUST%04d", idCounter.getAndIncrement());
    }

    public static void resetIdCounter() {
        idCounter.set(1);
    }

    private static class ResolvedAttributes {
        String primaryName;
        String primaryDob;
        String primaryCity;
        String primarySegment = "Mass";
        String primaryPan;
        String primaryMobile;
        String primaryEmail;
        String assignedRmId = "RM101"; // Default RM assigned
        List<String> linkedSources = new ArrayList<>();
        List<AttributeConflict> attributeConflicts = new ArrayList<>();
    }

    /**
     * Resolves attributes across records according to source precedence.
     * Captures any differing values in attributeConflicts.
     */
    private ResolvedAttributes resolveAttributes(List<SourceRecordRef> records) {
        ResolvedAttributes res = new ResolvedAttributes();
        List<SourceRecordRef> sorted = sortRecordsByPrecedence(records);

        Map<String, List<ValueWithSource>> emails = new LinkedHashMap<>();
        Map<String, List<ValueWithSource>> cities = new LinkedHashMap<>();
        Map<String, List<ValueWithSource>> names = new LinkedHashMap<>();
        Map<String, List<ValueWithSource>> mobiles = new LinkedHashMap<>();

        for (SourceRecordRef r : sorted) {
            if (!res.linkedSources.contains(r.sourceSystem())) {
                res.linkedSources.add(r.sourceSystem());
            }

            NormalizedFields norm = r.normalized();
            if (norm != null) {
                if (res.primaryName == null && norm.getName() != null) res.primaryName = norm.getName();
                if (res.primaryDob == null && norm.getDob() != null) res.primaryDob = norm.getDob();
                if (res.primaryCity == null && norm.getCity() != null) res.primaryCity = norm.getCity();
                if (res.primaryPan == null && norm.getPan() != null) res.primaryPan = norm.getPan();
                if (res.primaryMobile == null && norm.getMobile() != null) res.primaryMobile = norm.getMobile();
                if (res.primaryEmail == null && norm.getEmail() != null) res.primaryEmail = norm.getEmail();

                if (norm.getEmail() != null) {
                    emails.computeIfAbsent(norm.getEmail(), k -> new ArrayList<>())
                            .add(new ValueWithSource(norm.getEmail(), r.sourceSystem()));
                }
                if (norm.getCity() != null) {
                    cities.computeIfAbsent(norm.getCity(), k -> new ArrayList<>())
                            .add(new ValueWithSource(norm.getCity(), r.sourceSystem()));
                }
                if (norm.getName() != null && !norm.getName().isBlank()) {
                    names.computeIfAbsent(norm.getName(), k -> new ArrayList<>())
                            .add(new ValueWithSource(norm.getName(), r.sourceSystem()));
                }
                if (norm.getMobile() != null) {
                    mobiles.computeIfAbsent(norm.getMobile(), k -> new ArrayList<>())
                            .add(new ValueWithSource(norm.getMobile(), r.sourceSystem()));
                }
            }

            // Extract segment / rm_id / raw metadata if available
            if (r.raw() != null) {
                if (r.raw().containsKey("segment")) res.primarySegment = r.raw().get("segment");
                if (r.raw().containsKey("rm_id")) res.assignedRmId = r.raw().get("rm_id");
                if (r.raw().containsKey("rmId")) res.assignedRmId = r.raw().get("rmId");
            }
        }

        // Build attributeConflicts for Email if multiple distinct emails exist
        if (emails.size() > 1) {
            String winnerValue = res.primaryEmail;
            String winnerSource = emails.get(winnerValue) != null && !emails.get(winnerValue).isEmpty()
                    ? emails.get(winnerValue).get(0).source : "UNKNOWN";
            List<AttributeConflict.ConflictingValue> losers = new ArrayList<>();
            emails.forEach((val, list) -> {
                if (!val.equalsIgnoreCase(winnerValue)) {
                    list.forEach(v -> losers.add(new AttributeConflict.ConflictingValue(v.value, v.source)));
                }
            });
            res.attributeConflicts.add(AttributeConflict.builder()
                    .field("email")
                    .selectedValue(winnerValue)
                    .selectedSource(winnerSource)
                    .conflictingValues(losers)
                    .build());
        }

        // Build attributeConflicts for Name if multiple distinct names exist across sources
        if (names.size() > 1) {
            String winnerValue = res.primaryName;
            String winnerSource = (winnerValue != null && names.get(winnerValue) != null && !names.get(winnerValue).isEmpty())
                    ? names.get(winnerValue).get(0).source : "UNKNOWN";
            List<AttributeConflict.ConflictingValue> losers = new ArrayList<>();
            names.forEach((val, list) -> {
                if (!val.equalsIgnoreCase(winnerValue)) {
                    list.forEach(v -> losers.add(new AttributeConflict.ConflictingValue(v.value, v.source)));
                }
            });
            res.attributeConflicts.add(AttributeConflict.builder()
                    .field("name")
                    .selectedValue(winnerValue)
                    .selectedSource(winnerSource)
                    .conflictingValues(losers)
                    .build());
        }

        // Build attributeConflicts for Mobile if multiple distinct mobiles exist across sources
        if (mobiles.size() > 1) {
            String winnerValue = res.primaryMobile;
            String winnerSource = (winnerValue != null && mobiles.get(winnerValue) != null && !mobiles.get(winnerValue).isEmpty())
                    ? mobiles.get(winnerValue).get(0).source : "UNKNOWN";
            List<AttributeConflict.ConflictingValue> losers = new ArrayList<>();
            mobiles.forEach((val, list) -> {
                if (!val.equals(winnerValue)) {
                    list.forEach(v -> losers.add(new AttributeConflict.ConflictingValue(v.value, v.source)));
                }
            });
            res.attributeConflicts.add(AttributeConflict.builder()
                    .field("mobile")
                    .selectedValue(winnerValue)
                    .selectedSource(winnerSource)
                    .conflictingValues(losers)
                    .build());
        }

        // Build attributeConflicts for City if multiple distinct cities exist across sources
        if (cities.size() > 1) {
            String winnerValue = res.primaryCity;
            String winnerSource = (winnerValue != null && cities.get(winnerValue) != null && !cities.get(winnerValue).isEmpty())
                    ? cities.get(winnerValue).get(0).source : "UNKNOWN";
            List<AttributeConflict.ConflictingValue> losers = new ArrayList<>();
            cities.forEach((val, list) -> {
                if (!val.equalsIgnoreCase(winnerValue)) {
                    list.forEach(v -> losers.add(new AttributeConflict.ConflictingValue(v.value, v.source)));
                }
            });
            res.attributeConflicts.add(AttributeConflict.builder()
                    .field("city")
                    .selectedValue(winnerValue)
                    .selectedSource(winnerSource)
                    .conflictingValues(losers)
                    .build());
        }

        return res;
    }

    private record ValueWithSource(String value, String source) {}

    private List<SourceRecordRef> sortRecordsByPrecedence(List<SourceRecordRef> records) {
        List<SourceRecordRef> copy = new ArrayList<>(records);
        copy.sort(Comparator.comparingInt(r -> {
            int idx = sourcePrecedence.indexOf(r.sourceSystem());
            return idx >= 0 ? idx : 99;
        }));
        return copy;
    }

    private Double calculateTotalRelationshipValue(List<SourceRecordRef> records) {
        double total = 0.0;
        for (SourceRecordRef r : records) {
            if (r.raw() != null) {
                for (String key : List.of("relationship_value", "aum", "equity_aum", "mf_aum", "sum_assured", "loan_amount")) {
                    if (r.raw().containsKey(key)) {
                        try {
                            total += Double.parseDouble(r.raw().get(key));
                            break;
                        } catch (NumberFormatException ignored) {}
                    }
                }
            }
        }
        return total;
    }
}
