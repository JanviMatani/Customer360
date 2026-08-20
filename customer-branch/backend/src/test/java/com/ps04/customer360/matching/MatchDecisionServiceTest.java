package com.ps04.customer360.matching;

import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import com.ps04.customer360.matching.model.MatchDecision;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MatchDecisionServiceTest {

    private ConflictDetectionService conflictDetectionService;
    private MatchDecisionService matchDecisionService;

    @BeforeEach
    void setUp() {
        conflictDetectionService = new ConflictDetectionService();
        matchDecisionService = new MatchDecisionService(null, conflictDetectionService);
    }

    @Test
    void identicalStrongIdentifiers_autoMerges() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("mobile").weight(25).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("dob").weight(10).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.MATCH).similarity(1.0).build()
        );

        MatchDecisionService.DecisionOutput out = matchDecisionService.decideFromEvidence(95, evidence, 85, 60);

        assertThat(out.decision()).isEqualTo(MatchDecision.AUTO_MERGE);
    }

    @Test
    void emailConflictButStrongOtherFields_manualReview() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("mobile").weight(25).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("email").weight(15).result(MatchResult.CONFLICT).build(),
                FieldEvidence.builder().field("dob").weight(10).result(MatchResult.MATCH).build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.PARTIAL).similarity(0.93).build(),
                FieldEvidence.builder().field("city").weight(3).result(MatchResult.MATCH).build()
        );

        MatchDecisionService.DecisionOutput out = matchDecisionService.decideFromEvidence(84, evidence, 85, 60);

        assertThat(out.decision()).isEqualTo(MatchDecision.MANUAL_REVIEW);
    }

    @Test
    void sameMobileDifferentPersonEverythingElse_separate() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("mobile").weight(25).result(MatchResult.MATCH).valueA("9876543210").valueB("9876543210").build(),
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.CONFLICT).valueA("ABC12345").valueB("JKL11223").build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.PARTIAL).similarity(0.30).valueA("Rahul Sharma").valueB("Amit Patil").build()
        );

        MatchDecisionService.DecisionOutput out = matchDecisionService.decideFromEvidence(65, evidence, 85, 60);

        assertThat(out.decision()).isEqualTo(MatchDecision.SEPARATE);
    }

    @Test
    void panCollisionLowNameSimilarity_forcedManualReview() {
        List<FieldEvidence> evidence = List.of(
                FieldEvidence.builder().field("pan").weight(40).result(MatchResult.MATCH).valueA("MNO44556").valueB("MNO44556").build(),
                FieldEvidence.builder().field("name").weight(7).result(MatchResult.PARTIAL).similarity(0.22).valueA("Rahul Kumar").valueB("Rahul Sharmai").build()
        );

        MatchDecisionService.DecisionOutput out = matchDecisionService.decideFromEvidence(88, evidence, 85, 60);

        assertThat(out.decision()).isEqualTo(MatchDecision.MANUAL_REVIEW);
        assertThat(out.isDangerousConflict()).isTrue();
    }
}
