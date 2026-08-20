package com.ps04.customer360.matching;

import com.ps04.customer360.ingestion.model.NormalizedFields;
import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.matching.model.FieldEvidence.MatchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class DeterministicMatchServiceTest {

    private DeterministicMatchService service;
    private Map<String, Integer> weights;

    @BeforeEach
    void setUp() {
        service = new DeterministicMatchService();
        weights = Map.of("pan", 40, "mobile", 25, "email", 15, "dob", 10);
    }

    @Test
    void panOneCharacterOff_treatedAsHardConflictNotFuzzy() {
        NormalizedFields a = NormalizedFields.builder().pan("ABC12345").build();
        NormalizedFields b = NormalizedFields.builder().pan("ABC12346").build();

        List<FieldEvidence> evidence = service.compare(a, b, weights);
        FieldEvidence panEv = evidence.stream().filter(e -> "pan".equals(e.getField())).findFirst().orElseThrow();

        assertThat(panEv.getResult()).isEqualTo(MatchResult.CONFLICT);
    }

    @Test
    void missingField_treatedAsMissingResultNotConflict() {
        NormalizedFields a = NormalizedFields.builder().email(null).build();
        NormalizedFields b = NormalizedFields.builder().email("rahul@gmail.com").build();

        List<FieldEvidence> evidence = service.compare(a, b, weights);
        FieldEvidence emailEv = evidence.stream().filter(e -> "email".equals(e.getField())).findFirst().orElseThrow();

        assertThat(emailEv.getResult()).isEqualTo(MatchResult.MISSING);
    }
}
