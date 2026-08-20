package com.ps04.customer360.matching;

import com.ps04.customer360.ingestion.model.NormalizedFields;
import com.ps04.customer360.matching.model.FieldEvidence;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.ps04.customer360.matching.model.FieldEvidence.MatchResult.*;

/**
 * Deterministic (exact) matching service.
 *
 * Compares pan, mobile, email, and dob with exact-string matching only.
 * Name and city are handled by FuzzyMatchService.
 *
 * CRITICAL rules:
 * - PAN is NEVER fuzzy. ABC12345 vs ABC12346 = CONFLICT (not PARTIAL).
 * - DOB is NEVER fuzzy. Exact date comparison only.
 * - MISSING: if either side is null, the field contributes nothing to the score (result=MISSING).
 *
 * Weights come from the caller (ConfidenceScoringService reads them from config_rules).
 * This service only produces FieldEvidence objects — it does not apply weights itself.
 */
@Service
public class DeterministicMatchService {

    /**
     * Produces exact-match evidence for the 4 deterministic fields:
     * pan, mobile, email, dob.
     *
     * @param a          normalized fields from record A
     * @param b          normalized fields from record B
     * @param weights    field -> configured weight map (e.g. {pan:40, mobile:25, email:15, dob:10})
     * @return list of FieldEvidence, one per field
     */
    public List<FieldEvidence> compare(NormalizedFields a, NormalizedFields b,
                                       Map<String, Integer> weights) {
        List<FieldEvidence> evidence = new ArrayList<>();

        evidence.add(compareExact("pan",    a.getPan(),    b.getPan(),    weights.getOrDefault("pan", 40)));
        evidence.add(compareExact("mobile", a.getMobile(), b.getMobile(), weights.getOrDefault("mobile", 25)));
        evidence.add(compareExact("email",  a.getEmail(),  b.getEmail(),  weights.getOrDefault("email", 15)));
        evidence.add(compareExact("dob",    a.getDob(),    b.getDob(),    weights.getOrDefault("dob", 10)));

        return evidence;
    }

    private FieldEvidence compareExact(String field, String valA, String valB, int weight) {
        if (valA == null && valB == null) {
            return FieldEvidence.builder()
                    .field(field).valueA(null).valueB(null)
                    .weight(weight).result(MISSING).build();
        }
        if (valA == null || valB == null) {
            return FieldEvidence.builder()
                    .field(field)
                    .valueA(valA)
                    .valueB(valB)
                    .weight(weight)
                    .result(MISSING)
                    .build();
        }
        FieldEvidence.MatchResult result = valA.equals(valB) ? MATCH : CONFLICT;
        return FieldEvidence.builder()
                .field(field).valueA(valA).valueB(valB)
                .weight(weight).result(result).build();
    }
}
