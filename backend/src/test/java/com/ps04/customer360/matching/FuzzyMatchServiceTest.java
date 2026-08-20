package com.ps04.customer360.matching;

import com.ps04.customer360.ingestion.model.NormalizedFields;
import com.ps04.customer360.matching.model.FieldEvidence;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class FuzzyMatchServiceTest {

    private FuzzyMatchService service;

    @BeforeEach
    void setUp() {
        service = new FuzzyMatchService();
    }

    @Test
    void nameTokenSwap_scoresHighSimilarity() {
        double sim = service.nameSimularity("rahul sharma", "sharma rahul");
        assertThat(sim).isGreaterThanOrEqualTo(0.90);
    }

    @Test
    void nameTypo_scoresHighSimilarity() {
        double sim = service.nameSimularity("rahul sharma", "rhaul sharma");
        assertThat(sim).isGreaterThan(0.85);
    }
}
