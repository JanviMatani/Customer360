package com.ps04.customer360.common;

import org.springframework.stereotype.Service;

/**
 * MaskingService — applied centrally at the DTO-mapping layer.
 *
 * Masking rules:
 *  PAN    "ABC12345"   → "ABC1****"    (first 4 chars visible)
 *  Mobile "9876543210" → "98765*****"  (first 5 digits visible)
 *
 * These masks are applied to EVERY API response for rm and manager roles.
 * The reveal-on-click flow goes back to the backend with an explicit reveal endpoint
 * (not implemented yet but the architecture supports it — the masking is server-side).
 *
 * CRITICAL: masking is done here in a single choke point so no controller can
 * accidentally leak a raw value. Never unmask client-side.
 */
@Service
public class MaskingService {

    public String maskPan(String pan) {
        if (pan == null || pan.length() < 4) return pan;
        return pan.substring(0, 4) + "****";
    }

    public String maskMobile(String mobile) {
        if (mobile == null || mobile.length() < 5) return mobile;
        return mobile.substring(0, 5) + "*****";
    }

    /** Returns the pan masked if shouldMask is true, otherwise the raw value. */
    public String maybeMaskPan(String pan, boolean shouldMask) {
        return shouldMask ? maskPan(pan) : pan;
    }

    public String maybeMaskMobile(String mobile, boolean shouldMask) {
        return shouldMask ? maskMobile(mobile) : mobile;
    }
}
