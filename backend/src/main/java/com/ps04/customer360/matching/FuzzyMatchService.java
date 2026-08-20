package com.ps04.customer360.matching;

import com.ps04.customer360.ingestion.model.NormalizedFields;
import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Fuzzy matching service for name and city fields.
 *
 * Name comparison uses two techniques and takes the MAX:
 *  1. Jaro-Winkler similarity on the full normalized name string.
 *  2. Token-set ratio: sort tokens, join, then compute Jaro-Winkler — handles
 *     token-order swaps like "Sharma Rahul" vs "Rahul Sharma".
 *
 * City: exact match after normalization (the city set in this dataset is clean enough
 * that fuzzy is not needed, but the interface accepts the same weight map as deterministic).
 */
@Service
public class FuzzyMatchService {

    private static final JaroWinklerSimilarity JW = new JaroWinklerSimilarity();

    /**
     * Produces fuzzy-match evidence for name and city.
     *
     * @param a       normalized fields from record A
     * @param b       normalized fields from record B
     * @param weights field -> configured weight map
     * @return list with one FieldEvidence per fuzzy field
     */
    public List<FieldEvidence> compare(NormalizedFields a, NormalizedFields b,
                                       Map<String, Integer> weights) {
        List<FieldEvidence> evidence = new ArrayList<>();
        evidence.add(compareName(a.getNameForMatch(), b.getNameForMatch(),
                weights.getOrDefault("name", 7)));
        evidence.add(compareCity(a.getCity(), b.getCity(),
                weights.getOrDefault("city", 3)));
        return evidence;
    }

    // ─── Name ────────────────────────────────────────────────────────────────

    FieldEvidence compareName(String nameA, String nameB, int weight) {
        if (nameA == null || nameA.isBlank() || nameB == null || nameB.isBlank()) {
            return FieldEvidence.builder()
                    .field("name").valueA(nameA).valueB(nameB)
                    .weight(weight).result(MatchResult.MISSING).build();
        }

        double jwScore     = JW.apply(nameA, nameB);
        double tokenScore  = tokenSetJw(nameA, nameB);
        double similarity  = Math.max(jwScore, tokenScore);

        MatchResult result;
        if (similarity >= 1.0) {
            result = MatchResult.MATCH;
        } else if (similarity > 0.0) {
            result = MatchResult.PARTIAL;
        } else {
            result = MatchResult.CONFLICT;
        }

        return FieldEvidence.builder()
                .field("name").valueA(nameA).valueB(nameB)
                .weight(weight).result(result).similarity(similarity)
                .build();
    }

    // ─── City ────────────────────────────────────────────────────────────────

    FieldEvidence compareCity(String cityA, String cityB, int weight) {
        if (cityA == null || cityA.isBlank() || cityB == null || cityB.isBlank()) {
            return FieldEvidence.builder()
                    .field("city").valueA(cityA).valueB(cityB)
                    .weight(weight).result(MatchResult.MISSING).build();
        }
        MatchResult result = cityA.equalsIgnoreCase(cityB) ? MatchResult.MATCH : MatchResult.CONFLICT;
        return FieldEvidence.builder()
                .field("city").valueA(cityA).valueB(cityB)
                .weight(weight).result(result).build();
    }

    // ─── Token-set Jaro-Winkler ────────────────────────────────────────────

    /**
     * Sorts the tokens of each name alphabetically and joins them, then computes Jaro-Winkler.
     * "rahul sharma" → "rahul sharma" (already sorted)
     * "sharma rahul" → "rahul sharma" after sort → high similarity with the above.
     */
    private double tokenSetJw(String a, String b) {
        String sortedA = sortedTokens(a);
        String sortedB = sortedTokens(b);
        return JW.apply(sortedA, sortedB);
    }

    private String sortedTokens(String name) {
        String[] tokens = name.trim().split("\\s+");
        Arrays.sort(tokens);
        return String.join(" ", tokens);
    }

    /**
     * Exposed for unit testing.
     */
    public double nameSimularity(String nameA, String nameB) {
        if (nameA == null || nameB == null) return 0.0;
        double jw = JW.apply(nameA, nameB);
        double ts = tokenSetJw(nameA, nameB);
        return Math.max(jw, ts);
    }
}
