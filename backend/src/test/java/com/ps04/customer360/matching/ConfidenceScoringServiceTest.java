package com.ps04.customer360.matching;

import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ConfidenceScoringServiceTest {

    private ConfidenceScoringService service;

    @BeforeEach
    void setUp() {
        service = new ConfidenceScoringService();
    }

    @Test
    void missingFieldIsNotScoredAsConflict() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("mobile").weight(25).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("email").weight(15).result(MatchResult.MISSING).build(), // missing email
                FieldEvidence.builder().field("dob").weight(10).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("city").weight(3).result(MatchResult.MATCH).build()
        );

        int score = service.computeScore(evidence);

        // Total non-missing weight = 40+25+10+7+3 = 85.
        // All non-missing match (85/85 = 100%)
        assertThat(score).isEqualTo(100);
    }
}
