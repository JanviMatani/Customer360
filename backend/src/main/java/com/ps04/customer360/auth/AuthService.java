package com.ps04.customer360.auth;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.auth.dto.LoginRequest;
import com.ps04.customer360.auth.dto.LoginResponse;
import com.ps04.customer360.auth.dto.MeResponse;
import com.ps04.customer360.auth.model.User;
import com.ps04.customer360.common.exception.ForbiddenException;
import com.ps04.customer360.security.AppPrincipal;
import com.ps04.customer360.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Value("${app.security.max-failed-logins:5}")
    private int maxFailedLogins;

    @Value("${app.security.lockout-duration-minutes:30}")
    private int lockoutDurationMinutes;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuditService auditService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    public LoginResponse login(LoginRequest req, String clientIp) {
        Optional<User> uOpt = userRepo.findByEmail(req.getEmail());
        if (uOpt.isEmpty()) {
            auditService.log(req.getEmail(), "unknown", "LOGIN_FAILED", "user", req.getEmail(), null, null, clientIp, "User not found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        User user = uOpt.get();

        // Check if account is locked
        if (user.getLockedUntil() != null) {
            if (Instant.now().isBefore(user.getLockedUntil())) {
                long minutesLeft = ChronoUnit.MINUTES.between(Instant.now(), user.getLockedUntil()) + 1;
                auditService.log(user.getEmail(), user.getRole(), "LOGIN_BLOCKED_LOCKED", "user", user.getEmail(), null, null, clientIp, "Locked account login attempt");
                throw new ResponseStatusException(HttpStatus.LOCKED, "Account locked due to 5 consecutive failed login attempts. Try again in " + minutesLeft + " minutes.");
            } else {
                // Lock expired
                user.setLockedUntil(null);
                user.setFailedLoginAttempts(0);
                userRepo.save(user);
            }
        }

        // Validate password
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            int fails = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(fails);

            if (fails >= maxFailedLogins) {
                user.setLockedUntil(Instant.now().plus(lockoutDurationMinutes, ChronoUnit.MINUTES));
                userRepo.save(user);
                auditService.log(user.getEmail(), user.getRole(), "ACCOUNT_LOCKED", "user", user.getEmail(), null, null, clientIp, "Account locked after 5 failed attempts");
                throw new ResponseStatusException(HttpStatus.LOCKED, "Account locked due to 5 consecutive failed login attempts.");
            }

            userRepo.save(user);
            auditService.log(user.getEmail(), user.getRole(), "LOGIN_FAILED", "user", user.getEmail(), null, null, clientIp, "Wrong password attempt (" + fails + "/" + maxFailedLogins + ")");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // Login successful: reset failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepo.save(user);

        String role = (req.getRole() != null && !req.getRole().isBlank()) ? req.getRole() : user.getRole();
        String token = jwtService.generateToken(user.getEmail(), role, user.getRmId());

        auditService.log(user.getEmail(), role, "LOGIN", "user", user.getEmail(), null, null, clientIp, "Login successful");

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(role)
                .rmId(user.getRmId())
                .expiresInMs(jwtExpirationMs)
                .build();
    }

    public void logout(AppPrincipal principal) {
        if (principal != null && principal.token() != null) {
            jwtService.invalidate(principal.token());
            auditService.log(principal.email(), principal.role(), "LOGOUT", "user", principal.email(), "Logged out successfully");
        }
    }

    public MeResponse getMe(AppPrincipal principal) {
        User user = userRepo.findByEmail(principal.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return MeResponse.builder()
                .email(user.getEmail())
                .role(principal.role())
                .rmId(user.getRmId())
                .managerOf(user.getManagerOf())
                .build();
    }
}
