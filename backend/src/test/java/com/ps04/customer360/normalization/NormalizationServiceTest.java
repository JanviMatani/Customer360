package com.ps04.customer360.normalization;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class NormalizationServiceTest {

    private NormalizationService service;

    @BeforeEach
    void setUp() {
        service = new NormalizationService();
    }

    @ParameterizedTest
    @CsvSource({
            "'+91 98765 43210', 9876543210",
            "'+91-98765-43210', 9876543210",
            "' 98220 44556 ',   9822044556",
            "'9876543210',      9876543210"
    })
    void normalizesMobileVariants(String raw, String expected) {
        assertThat(service.normalizeMobile(raw)).isEqualTo(expected);
    }

    @Test
    void treatsPanNotAvailableLiteralAsNull() {
        assertThat(service.normalizePan("PAN_NOT_AVAILABLE")).isNull();
        assertThat(service.normalizePan("  ")).isNull();
        assertThat(service.normalizePan("ABC12345")).isEqualTo("ABC12345");
        assertThat(service.normalizePan("abc12345")).isEqualTo("ABC12345");
        assertThat(service.normalizePan("N/A")).isNull();
    }

    @Test
    void stripsHonorificsAndCollapsesWhitespace() {
        assertThat(service.normalizeNameForMatch("  Ms. Neha  Kulkarni  "))
                .isEqualTo("neha kulkarni");
        assertThat(service.normalizeName("  Mr. Rahul   Sharma  "))
                .isEqualTo("Rahul Sharma");
    }

    @ParameterizedTest
    @ValueSource(strings = {"1998-05-12", "12-05-1998", "12/05/1998"})
    void parsesAllObservedDobFormatsToSameIsoDate(String raw) {
        assertThat(service.normalizeDob(raw, "25-34")).isEqualTo("1998-05-12");
    }
}
