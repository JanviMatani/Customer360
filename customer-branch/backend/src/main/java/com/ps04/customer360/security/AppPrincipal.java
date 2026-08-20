package com.ps04.customer360.security;

/**
 * The authenticated principal stored in the Spring Security context.
 * Carries role and rmId so DataScopeService can build Mongo query filters
 * without ever trusting client-supplied query parameters.
 */
public record AppPrincipal(
        String email,
        String role,
        String rmId,    // null for manager/admin
        String token    // raw JWT for logout blacklisting
) {}
