package com.ps04.customer360.matching;

import com.ps04.customer360.ingestion.RawEquityRepo;
import com.ps04.customer360.ingestion.RawInsuranceRepo;
import com.ps04.customer360.ingestion.RawLoanRepo;
import com.ps04.customer360.ingestion.RawMfRepo;
import com.ps04.customer360.ingestion.RawWealthRepo;
import com.ps04.customer360.ingestion.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Candidate Generation / Blocking Service.
 *
 * For a given source record, generates candidate records from ALL OTHER source systems.
 * Blocking keys generated:
 *   1. pan (if not null)
 *   2. mobile (if not null)
 *   3. email (if not null)
 *   4. name_dob_city composite (always generated as fallback, e.g. "sneha iyer|1992-07-18|bengaluru").
 *
 * The composite key (4) is mandatory: it is what surfaces records like Sneha Iyer (EQ1007/INS2007)
 * who have no PAN, mobile, or email anywhere in any system.
 */
@Service
public class CandidateGenerationService {

    private final RawEquityRepo equityRepo;
    private final RawMfRepo mfRepo;
    private final RawInsuranceRepo insuranceRepo;
    private final RawLoanRepo loanRepo;
    private final RawWealthRepo wealthRepo;

    public CandidateGenerationService(RawEquityRepo equityRepo, RawMfRepo mfRepo,
                                      RawInsuranceRepo insuranceRepo, RawLoanRepo loanRepo,
                                      RawWealthRepo wealthRepo) {
        this.equityRepo = equityRepo;
        this.mfRepo = mfRepo;
        this.insuranceRepo = insuranceRepo;
        this.loanRepo = loanRepo;
        this.wealthRepo = wealthRepo;
    }

    public record SourceRecordRef(
            String sourceSystem,
            String sourceCustomerId,
            NormalizedFields normalized,
            Map<String, String> raw
    ) {}

    /**
     * Retrieves all candidate records from other source systems for the given target record.
     */
    public List<SourceRecordRef> findCandidates(SourceRecordRef target) {
        NormalizedFields targetNorm = target.normalized();
        if (targetNorm == null) return List.of();

        Set<String> targetSystemsToExclude = Set.of(target.sourceSystem());
        Map<String, SourceRecordRef> candidates = new LinkedHashMap<>();

        // 1. PAN matching
        if (targetNorm.getPan() != null && !targetNorm.getPan().isBlank()) {
            addCandidatesByPan(targetNorm.getPan(), targetSystemsToExclude, candidates);
        }

        // 2. Mobile matching
        if (targetNorm.getMobile() != null && !targetNorm.getMobile().isBlank()) {
            addCandidatesByMobile(targetNorm.getMobile(), targetSystemsToExclude, candidates);
        }

        // 3. Email matching
        if (targetNorm.getEmail() != null && !targetNorm.getEmail().isBlank()) {
            addCandidatesByEmail(targetNorm.getEmail(), targetSystemsToExclude, candidates);
        }

        // 4. Fallback Composite blocking key: name_dob_city
        String compositeKey = buildNameDobCityKey(targetNorm);
        if (compositeKey != null) {
            addCandidatesByCompositeKey(targetNorm, targetSystemsToExclude, candidates);
        }

        // Filter out target itself if it managed to creep in
        candidates.remove(keyFor(target.sourceSystem(), target.sourceCustomerId()));

        return new ArrayList<>(candidates.values());
    }

    /**
     * Returns all records from all 5 raw collections as SourceRecordRef.
     */
    public List<SourceRecordRef> getAllSourceRecords() {
        List<SourceRecordRef> all = new ArrayList<>();
        equityRepo.findAll().forEach(r -> all.add(toRef("EQUITY", r.getSourceCustomerId(), r.getNormalized(), r.getRaw())));
        mfRepo.findAll().forEach(r -> all.add(toRef("MF", r.getSourceCustomerId(), r.getNormalized(), r.getRaw())));
        insuranceRepo.findAll().forEach(r -> all.add(toRef("INSURANCE", r.getSourceCustomerId(), r.getNormalized(), r.getRaw())));
        loanRepo.findAll().forEach(r -> all.add(toRef("LOANS", r.getSourceCustomerId(), r.getNormalized(), r.getRaw())));
        wealthRepo.findAll().forEach(r -> all.add(toRef("WEALTH", r.getSourceCustomerId(), r.getNormalized(), r.getRaw())));
        return all;
    }

    private SourceRecordRef toRef(String sys, String cid, NormalizedFields norm, Map<String, String> raw) {
        return new SourceRecordRef(sys, cid, norm, raw);
    }

    private String keyFor(String sys, String cid) {
        return sys + ":" + cid;
    }

    private void addCandidatesByPan(String pan, Set<String> excludeSystems, Map<String, SourceRecordRef> map) {
        if (!excludeSystems.contains("EQUITY")) {
            equityRepo.findByNormalizedPan(pan).forEach(r -> put(map, "EQUITY", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("MF")) {
            mfRepo.findByNormalizedPan(pan).forEach(r -> put(map, "MF", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("INSURANCE")) {
            insuranceRepo.findByNormalizedPan(pan).forEach(r -> put(map, "INSURANCE", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("LOANS")) {
            loanRepo.findByNormalizedPan(pan).forEach(r -> put(map, "LOANS", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("WEALTH")) {
            wealthRepo.findByNormalizedPan(pan).forEach(r -> put(map, "WEALTH", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
    }

    private void addCandidatesByMobile(String mobile, Set<String> excludeSystems, Map<String, SourceRecordRef> map) {
        if (!excludeSystems.contains("EQUITY")) {
            equityRepo.findByNormalizedMobile(mobile).forEach(r -> put(map, "EQUITY", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("MF")) {
            mfRepo.findByNormalizedMobile(mobile).forEach(r -> put(map, "MF", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("INSURANCE")) {
            insuranceRepo.findByNormalizedMobile(mobile).forEach(r -> put(map, "INSURANCE", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("LOANS")) {
            loanRepo.findByNormalizedMobile(mobile).forEach(r -> put(map, "LOANS", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("WEALTH")) {
            wealthRepo.findByNormalizedMobile(mobile).forEach(r -> put(map, "WEALTH", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
    }

    private void addCandidatesByEmail(String email, Set<String> excludeSystems, Map<String, SourceRecordRef> map) {
        if (!excludeSystems.contains("EQUITY")) {
            equityRepo.findByNormalizedEmail(email).forEach(r -> put(map, "EQUITY", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("MF")) {
            mfRepo.findByNormalizedEmail(email).forEach(r -> put(map, "MF", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("INSURANCE")) {
            insuranceRepo.findByNormalizedEmail(email).forEach(r -> put(map, "INSURANCE", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("LOANS")) {
            loanRepo.findByNormalizedEmail(email).forEach(r -> put(map, "LOANS", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
        if (!excludeSystems.contains("WEALTH")) {
            wealthRepo.findByNormalizedEmail(email).forEach(r -> put(map, "WEALTH", r.getSourceCustomerId(), r.getNormalized(), r.getRaw()));
        }
    }

    private void addCandidatesByCompositeKey(NormalizedFields targetNorm, Set<String> excludeSystems, Map<String, SourceRecordRef> map) {
        String targetName = targetNorm.getNameForMatch();
        String targetDob = targetNorm.getDob();

        // Scan records that share name or dob
        if (!excludeSystems.contains("EQUITY")) {
            equityRepo.findAll().forEach(r -> checkAndPutComposite(targetName, targetDob, r.getNormalized(), "EQUITY", r.getSourceCustomerId(), r.getRaw(), map));
        }
        if (!excludeSystems.contains("MF")) {
            mfRepo.findAll().forEach(r -> checkAndPutComposite(targetName, targetDob, r.getNormalized(), "MF", r.getSourceCustomerId(), r.getRaw(), map));
        }
        if (!excludeSystems.contains("INSURANCE")) {
            insuranceRepo.findAll().forEach(r -> checkAndPutComposite(targetName, targetDob, r.getNormalized(), "INSURANCE", r.getSourceCustomerId(), r.getRaw(), map));
        }
        if (!excludeSystems.contains("LOANS")) {
            loanRepo.findAll().forEach(r -> checkAndPutComposite(targetName, targetDob, r.getNormalized(), "LOANS", r.getSourceCustomerId(), r.getRaw(), map));
        }
        if (!excludeSystems.contains("WEALTH")) {
            wealthRepo.findAll().forEach(r -> checkAndPutComposite(targetName, targetDob, r.getNormalized(), "WEALTH", r.getSourceCustomerId(), r.getRaw(), map));
        }
    }

    private void checkAndPutComposite(String targetName, String targetDob, NormalizedFields candidateNorm,
                                     String sys, String cid, Map<String, String> raw, Map<String, SourceRecordRef> map) {
        if (candidateNorm == null) return;
        boolean nameMatches = targetName != null && targetName.equalsIgnoreCase(candidateNorm.getNameForMatch());
        boolean dobMatches = targetDob != null && targetDob.equals(candidateNorm.getDob());

        if (nameMatches || dobMatches) {
            put(map, sys, cid, candidateNorm, raw);
        }
    }

    private void put(Map<String, SourceRecordRef> map, String sys, String cid, NormalizedFields norm, Map<String, String> raw) {
        map.put(keyFor(sys, cid), new SourceRecordRef(sys, cid, norm, raw));
    }

    private String buildNameDobCityKey(NormalizedFields norm) {
        if (norm.getNameForMatch() == null || norm.getDob() == null) return null;
        return norm.getNameForMatch() + "|" + norm.getDob() + "|" + (norm.getCity() != null ? norm.getCity() : "");
    }
}
