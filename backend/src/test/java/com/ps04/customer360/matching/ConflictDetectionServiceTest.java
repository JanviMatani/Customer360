package com.ps04.customer360.matching;

import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ConflictDetectionServiceTest {

    private ConflictDetectionService service;

    @BeforeEach
    void setUp() {
        service = new ConflictDetectionService();
    }

    @Test
    void panCollisionLowNameSimilarity_forcesManualReview() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.MATCH).valueA("MNO44556").valueB("MNO44556").build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.PARTIAL).similarity(0.22).valueA("Rahul Kumar").valueB("Rahul Sharmai").build()
        );

        ConflictDetectionService.ConflictCheckResult res = service.evaluate(evidence);

        assertThat(res.hasHardConflict()).isTrue();
        assertThat(res.forceManualReview()).isTrue();
        assertThat(res.isDangerous()).isTrue();
    }

    @Test
    void sharedMobileDifferentPerson_forcesSeparate() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("mobile").weight(25).result(MatchResult.MATCH).valueA("9876543210").valueB("9876543210").build(),
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.CONFLICT).valueA("ABC12345").valueB("JKL11223").build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.PARTIAL).similarity(0.30).valueA("Rahul Sharma").valueB("Amit Patil").build()
        );

        ConflictDetectionService.ConflictCheckResult res = service.evaluate(evidence);

        assertThat(res.hasHardConflict()).isTrue();
        assertThat(res.forceSeparate()).isTrue();
    }
}
