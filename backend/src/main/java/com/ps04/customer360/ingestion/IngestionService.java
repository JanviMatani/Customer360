package com.ps04.customer360.ingestion;

import com.opencsv.CSVReader;
import com.ps04.customer360.config_rules.ConfigService;
import com.ps04.customer360.golden.GoldenCustomerService;
import com.ps04.customer360.ingestion.model.*;
import com.ps04.customer360.matching.*;
import com.ps04.customer360.matching.CandidateGenerationService.SourceRecordRef;
import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.MatchDecision;
import com.ps04.customer360.matching.model.MatchResult;
import com.ps04.customer360.normalization.NormalizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final NormalizationService normalizationService;
    private final RawEquityRepo equityRepo;
    private final RawMfRepo mfRepo;
    private final RawInsuranceRepo insuranceRepo;
    private final RawLoanRepo loanRepo;
    private final RawWealthRepo wealthRepo;
    private final CandidateGenerationService candidateGen;
    private final DeterministicMatchService deterministicMatch;
    private final FuzzyMatchService fuzzyMatch;
    private final ConfidenceScoringService scoringService;
    private final ConflictDetectionService conflictDetection;
    private final MatchDecisionService matchDecisionService;
    private final ConfigService configService;
    private final GoldenCustomerService goldenCustomerService;

    public IngestionService(NormalizationService normalizationService,
                            RawEquityRepo equityRepo, RawMfRepo mfRepo,
                            RawInsuranceRepo insuranceRepo, RawLoanRepo loanRepo,
                            RawWealthRepo wealthRepo, CandidateGenerationService candidateGen,
                            DeterministicMatchService deterministicMatch, FuzzyMatchService fuzzyMatch,
                            ConfidenceScoringService scoringService, ConflictDetectionService conflictDetection,
                            MatchDecisionService matchDecisionService, ConfigService configService,
                            GoldenCustomerService goldenCustomerService) {
        this.normalizationService = normalizationService;
        this.equityRepo = equityRepo;
        this.mfRepo = mfRepo;
        this.insuranceRepo = insuranceRepo;
        this.loanRepo = loanRepo;
        this.wealthRepo = wealthRepo;
        this.candidateGen = candidateGen;
        this.deterministicMatch = deterministicMatch;
        this.fuzzyMatch = fuzzyMatch;
        this.scoringService = scoringService;
        this.conflictDetection = conflictDetection;
        this.matchDecisionService = matchDecisionService;
        this.configService = configService;
        this.goldenCustomerService = goldenCustomerService;
    }

    /**
     * Reloads and re-normalizes all records, then reruns candidate generation and matching.
     */
    public int reloadAndMatchAll() {
        log.info("Starting pipeline match execution across all raw records...");

        // Re-normalize all existing records in database
        reNormalizeAllInDb();

        // Run full identity matching engine
        List<SourceRecordRef> allRecords = candidateGen.getAllSourceRecords();
        int processedPairs = 0;
        Set<String> evaluatedPairs = new HashSet<>();

        for (SourceRecordRef recA : allRecords) {
            List<SourceRecordRef> candidates = candidateGen.findCandidates(recA);
            for (SourceRecordRef recB : candidates) {
                String pairKey = buildPairKey(recA, recB);
                if (evaluatedPairs.contains(pairKey)) continue;
                evaluatedPairs.add(pairKey);

                MatchResult matchResult = evaluatePair(recA, recB);
                MatchDecisionService.DecisionOutput decisionOut = matchDecisionService.decide(matchResult);

                goldenCustomerService.processPairDecision(recA, recB, matchResult, decisionOut.decision());
                processedPairs++;
            }
        }

        // For records that had zero matches/candidates (e.g. single-source record Rahul Verma), create single-source golden customer
        createSingleSourceGoldenCustomers(allRecords);

        log.info("Pipeline match completed: evaluated {} record pairs.", processedPairs);
        return processedPairs;
    }

    /**
     * Evaluates a single pair of records through the matching algorithm core.
     */
    public MatchResult evaluatePair(SourceRecordRef recA, SourceRecordRef recB) {
        Map<String, Integer> weights = configService.getFieldWeights();

        List<FieldEvidence> evidence = new ArrayList<>();
        evidence.addAll(deterministicMatch.compare(recA.normalized(), recB.normalized(), weights));
        evidence.addAll(fuzzyMatch.compare(recA.normalized(), recB.normalized(), weights));

        int confidenceScore = scoringService.computeScore(evidence);
        ConflictDetectionService.ConflictCheckResult conflict = conflictDetection.evaluate(evidence);

        return MatchResult.builder()
                .sourceSystemA(recA.sourceSystem())
                .sourceCustomerIdA(recA.sourceCustomerId())
                .sourceSystemB(recB.sourceSystem())
                .sourceCustomerIdB(recB.sourceCustomerId())
                .confidenceScore(confidenceScore)
                .evidence(evidence)
                .hasHardConflict(conflict.hasHardConflict())
                .hardConflictReason(conflict.reason())
                .isDangerousConflict(conflict.isDangerous())
                .build();
    }

    // ─── Ingestion from CSV Stream (Idempotent) ─────────────────────────────

    public int ingestCsv(String sourceSystem, InputStream inputStream) throws Exception {
        String batchId = UUID.randomUUID().toString();
        try (CSVReader reader = new CSVReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String[] headers = reader.readNext();
            if (headers == null) return 0;

            // Trim headers
            for (int i = 0; i < headers.length; i++) {
                headers[i] = headers[i].trim();
            }

            String[] line;
            int count = 0;
            while ((line = reader.readNext()) != null) {
                Map<String, String> rawMap = new LinkedHashMap<>();
                for (int i = 0; i < Math.min(headers.length, line.length); i++) {
                    rawMap.put(headers[i], line[i].trim());
                }

                saveRawRecord(sourceSystem, rawMap, batchId);
                count++;
            }
            return count;
        }
    }

    private void saveRawRecord(String sourceSystem, Map<String, String> raw, String batchId) {
        NormalizedFields norm = computeNormalizedFields(raw);
        String cid = extractSourceCustomerId(sourceSystem, raw);
        String subKey = extractNaturalSubKey(sourceSystem, raw);
        String naturalKey = sourceSystem + ":" + cid + ":" + subKey;

        switch (sourceSystem.toUpperCase()) {
            case "EQUITY" -> {
                RawEquityCustomer rec = equityRepo.findByNaturalKey(naturalKey).orElse(new RawEquityCustomer());
                rec.setNaturalKey(naturalKey);
                rec.setSourceCustomerId(cid);
                rec.setRaw(raw);
                rec.setNormalized(norm);
                rec.setIngestedAt(Instant.now());
                rec.setIngestBatchId(batchId);
                equityRepo.save(rec);
            }
            case "MF" -> {
                RawMfCustomer rec = mfRepo.findByNaturalKey(naturalKey).orElse(new RawMfCustomer());
                rec.setNaturalKey(naturalKey);
                rec.setSourceCustomerId(cid);
                rec.setRaw(raw);
                rec.setNormalized(norm);
                rec.setIngestedAt(Instant.now());
                rec.setIngestBatchId(batchId);
                mfRepo.save(rec);
            }
            case "INSURANCE" -> {
                RawInsuranceCustomer rec = insuranceRepo.findByNaturalKey(naturalKey).orElse(new RawInsuranceCustomer());
                rec.setNaturalKey(naturalKey);
                rec.setSourceCustomerId(cid);
                rec.setRaw(raw);
                rec.setNormalized(norm);
                rec.setIngestedAt(Instant.now());
                rec.setIngestBatchId(batchId);
                insuranceRepo.save(rec);
            }
            case "LOANS" -> {
                RawLoanCustomer rec = loanRepo.findByNaturalKey(naturalKey).orElse(new RawLoanCustomer());
                rec.setNaturalKey(naturalKey);
                rec.setSourceCustomerId(cid);
                rec.setRaw(raw);
                rec.setNormalized(norm);
                rec.setIngestedAt(Instant.now());
                rec.setIngestBatchId(batchId);
                loanRepo.save(rec);
            }
            case "WEALTH" -> {
                RawWealthCustomer rec = wealthRepo.findByNaturalKey(naturalKey).orElse(new RawWealthCustomer());
                rec.setNaturalKey(naturalKey);
                rec.setSourceCustomerId(cid);
                rec.setRaw(raw);
                rec.setNormalized(norm);
                rec.setIngestedAt(Instant.now());
                rec.setIngestBatchId(batchId);
                wealthRepo.save(rec);
            }
        }
    }

    private NormalizedFields computeNormalizedFields(Map<String, String> raw) {
        String nameStr  = getFirstValue(raw, "customer_name", "name", "full_name");
        String mobileStr = getFirstValue(raw, "mobile", "mobile_number", "phone");
        String emailStr = getFirstValue(raw, "email", "email_id");
        String dobStr   = getFirstValue(raw, "dob", "date_of_birth");
        String panStr   = getFirstValue(raw, "pan", "pan_number");
        String cityStr  = getFirstValue(raw, "city");
        String ageBand  = getFirstValue(raw, "age_band");

        String name = normalizationService.normalizeName(nameStr);
        String nameForMatch = normalizationService.normalizeNameForMatch(nameStr);
        String mobile = normalizationService.normalizeMobile(mobileStr);
        String email = normalizationService.normalizeEmail(emailStr);
        String dob = normalizationService.normalizeDob(dobStr, ageBand);
        String pan = normalizationService.normalizePan(panStr);
        String city = normalizationService.normalizeCity(cityStr);

        return NormalizedFields.builder()
                .name(name)
                .nameForMatch(nameForMatch)
                .mobile(mobile)
                .email(email)
                .dob(dob)
                .pan(pan)
                .city(city)
                .build();
    }

    private void reNormalizeAllInDb() {
        equityRepo.findAll().forEach(r -> { r.setNormalized(computeNormalizedFields(r.getRaw())); equityRepo.save(r); });
        mfRepo.findAll().forEach(r -> { r.setNormalized(computeNormalizedFields(r.getRaw())); mfRepo.save(r); });
        insuranceRepo.findAll().forEach(r -> { r.setNormalized(computeNormalizedFields(r.getRaw())); insuranceRepo.save(r); });
        loanRepo.findAll().forEach(r -> { r.setNormalized(computeNormalizedFields(r.getRaw())); loanRepo.save(r); });
        wealthRepo.findAll().forEach(r -> { r.setNormalized(computeNormalizedFields(r.getRaw())); wealthRepo.save(r); });
    }

    private void createSingleSourceGoldenCustomers(List<SourceRecordRef> records) {
        for (SourceRecordRef r : records) {
            goldenCustomerService.mergeRecords(List.of(r), null, "SINGLE_SOURCE", 100, "system");
        }
    }

    private String getFirstValue(Map<String, String> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null && !map.get(k).isBlank()) {
                return map.get(k);
            }
        }
        return null;
    }

    private String extractSourceCustomerId(String sourceSystem, Map<String, String> raw) {
        return switch (sourceSystem.toUpperCase()) {
            case "EQUITY" -> getFirstValue(raw, "equity_customer_id", "source_customer_id", "customer_id");
            case "MF" -> getFirstValue(raw, "mf_customer_id", "source_customer_id", "customer_id");
            case "INSURANCE" -> getFirstValue(raw, "insurance_customer_id", "source_customer_id", "customer_id");
            case "LOANS" -> getFirstValue(raw, "loan_customer_id", "source_customer_id", "customer_id");
            case "WEALTH" -> getFirstValue(raw, "wealth_customer_id", "source_customer_id", "customer_id");
            default -> getFirstValue(raw, "source_customer_id", "customer_id");
        };
    }

    private String extractNaturalSubKey(String sourceSystem, Map<String, String> raw) {
        return switch (sourceSystem.toUpperCase()) {
            case "EQUITY" -> getFirstValue(raw, "equity_account_id", "account_id", "id");
            case "MF" -> getFirstValue(raw, "mf_account_id", "account_id", "id");
            case "INSURANCE" -> getFirstValue(raw, "policy_id", "policy_number", "id");
            case "LOANS" -> getFirstValue(raw, "loan_account_id", "loan_id", "id");
            case "WEALTH" -> getFirstValue(raw, "wealth_account_id", "account_id", "id");
            default -> "1";
        };
    }

    private String buildPairKey(SourceRecordRef a, SourceRecordRef b) {
        String kA = a.sourceSystem() + ":" + a.sourceCustomerId();
        String kB = b.sourceSystem() + ":" + b.sourceCustomerId();
        return kA.compareTo(kB) < 0 ? kA + "||" + kB : kB + "||" + kA;
    }
}
