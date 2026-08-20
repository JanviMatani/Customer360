package com.ps04.customer360.normalization;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Pure normalization functions — no Mongo or Spring-context dependency in the algorithm.
 * Each method is independently unit-testable. All methods are deterministic and side-effect-free.
 *
 * Handles every real torture case from the dataset (§2.3 of the spec):
 *  - Mobile: various +91 prefixes, stray spaces, no country code
 *  - Name: honorifics (Mr./Ms./Mrs./Dr.), double spaces, leading/trailing whitespace, mixed case
 *  - Email: mixed case, trim
 *  - DOB: yyyy-MM-dd, dd-MM-yyyy, dd/MM/yyyy; cross-validated against age_band
 *  - PAN: "PAN_NOT_AVAILABLE" literal and blank → null
 *  - City: lowercase, trim
 */
@Service
public class NormalizationService {

    private static final Logger log = LoggerFactory.getLogger(NormalizationService.class);

    private static final Pattern NON_DIGIT = Pattern.compile("[^0-9]");
    private static final Pattern WHITESPACE_RUN = Pattern.compile("\\s+");

    private static final Set<String> HONORIFICS = Set.of("mr", "mrs", "ms", "dr", "shri", "smt");

    private static final List<DateTimeFormatter> DOB_FORMATS = List.of(
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy")
    );

    // ─── Mobile ─────────────────────────────────────────────────────────────

    /**
     * Normalizes a raw mobile string to a 10-digit Indian mobile number.
     * Rules:
     *  1. Strip all non-digit characters.
     *  2. If the result is 12 digits and starts with 91, drop the leading 91.
     *  3. If the result is 10 digits, keep it.
     *  4. Otherwise, return null (invalid/empty).
     *
     * Examples from actual data:
     *  "+91 98765 43210"  → "9876543210"
     *  "+91-98765-43210"  → "9876543210"
     *  " 98220 44556 "    → "9822044556"
     *  "9876543210"       → "9876543210"
     *  ""                 → null
     */
    public String normalizeMobile(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String digits = NON_DIGIT.matcher(raw.trim()).replaceAll("");
        if (digits.length() == 12 && digits.startsWith("91")) {
            digits = digits.substring(2);
        }
        if (digits.length() == 10) return digits;
        log.debug("Could not normalize mobile '{}' → ignored", raw);
        return null;
    }

    // ─── Name ────────────────────────────────────────────────────────────────

    /**
     * Returns a display-form name: trimmed, whitespace-collapsed, honorific stripped,
     * but retaining original casing (first-letter-uppercase per token is preserved as-is
     * from the source, we just clean spacing/honorifics).
     */
    public String normalizeName(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String trimmed = raw.trim();
        String collapsed = WHITESPACE_RUN.matcher(trimmed).replaceAll(" ");
        // Strip leading honorific token if present
        String[] tokens = collapsed.split(" ");
        int start = 0;
        if (tokens.length > 1) {
            String firstLower = tokens[0].toLowerCase().replaceAll("[.]", "");
            if (HONORIFICS.contains(firstLower)) {
                start = 1;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < tokens.length; i++) {
            if (!tokens[i].isBlank()) {
                if (sb.length() > 0) sb.append(' ');
                sb.append(tokens[i]);
            }
        }
        return sb.toString().trim();
    }

    /**
     * Returns the lowercase comparison form of a name — used for fuzzy matching only,
     * never for display. Strips honorifics, collapses whitespace, lowercases.
     */
    public String normalizeNameForMatch(String raw) {
        return normalizeName(raw).toLowerCase();
    }

    // ─── Email ───────────────────────────────────────────────────────────────

    /**
     * Normalizes an email: lowercase, trim. Returns null if blank.
     */
    public String normalizeEmail(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return raw.trim().toLowerCase();
    }

    // ─── DOB ─────────────────────────────────────────────────────────────────

    /**
     * Parses a DOB string in any of the observed formats and returns an ISO yyyy-MM-dd string.
     * If ageBandHint is provided (e.g. "25-34"), the parsed year is cross-checked:
     *  the person's current age must fall within the band; if not, a warning is logged.
     *
     * Returns null if the input is blank or unparseable.
     *
     * Ambiguity note: "12-05-1998" is treated as dd-MM-yyyy (12 May 1998) because the
     * dd-MM-yyyy format is tried before MM-dd-yyyy in this dataset's context. The ageBandHint
     * cross-check catches cases where the interpretation leads to an implausible age.
     */
    public String normalizeDob(String raw, String ageBandHint) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.trim();
        for (DateTimeFormatter fmt : DOB_FORMATS) {
            try {
                LocalDate date = LocalDate.parse(trimmed, fmt);
                String iso = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                // Cross-check with ageBandHint if provided
                if (ageBandHint != null && !ageBandHint.isBlank()) {
                    validateAgeBand(date, ageBandHint, raw);
                }
                return iso;
            } catch (DateTimeParseException ignored) {
                // try next format
            }
        }
        log.warn("Could not parse DOB '{}' with any known format", raw);
        return null;
    }

    /** Convenience overload without age band hint. */
    public String normalizeDob(String raw) {
        return normalizeDob(raw, null);
    }

    private void validateAgeBand(LocalDate dob, String ageBandHint, String rawDob) {
        try {
            String[] parts = ageBandHint.split("[-–]");
            if (parts.length < 2) return;
            int low = Integer.parseInt(parts[0].trim());
            int high = Integer.parseInt(parts[1].trim());
            int age = LocalDate.now().getYear() - dob.getYear();
            if (age < low - 1 || age > high + 1) {
                log.warn("DOB '{}' parsed as {} gives age {}, but age_band is {} — possible format mismatch",
                        rawDob, dob, age, ageBandHint);
            }
        } catch (Exception e) {
            log.debug("Could not validate age band '{}': {}", ageBandHint, e.getMessage());
        }
    }

    // ─── PAN ─────────────────────────────────────────────────────────────────

    /**
     * Normalizes a PAN string.
     * Returns null if:
     *  - input is null or blank
     *  - input equals "PAN_NOT_AVAILABLE" (case-insensitive)
     *  - input is only whitespace
     * Otherwise, returns the trimmed, uppercased PAN.
     *
     * IMPORTANT: PAN is NEVER fuzzy-matched — exact comparison only.
     * "ABC12345" ≠ "ABC12346" is always a hard conflict, never a partial match.
     */
    public String normalizePan(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String trimmed = raw.trim();
        if (trimmed.equalsIgnoreCase("PAN_NOT_AVAILABLE")) return null;
        if (trimmed.equalsIgnoreCase("N/A") || trimmed.equalsIgnoreCase("NA")) return null;
        return trimmed.toUpperCase();
    }

    // ─── City ────────────────────────────────────────────────────────────────

    /**
     * Normalizes a city name: lowercase, trimmed, whitespace-collapsed.
     */
    public String normalizeCity(String raw) {
        if (raw == null || raw.isBlank()) return "";
        return WHITESPACE_RUN.matcher(raw.trim()).replaceAll(" ").toLowerCase();
    }
}
