package com.ps04.customer360.auth;

import com.ps04.customer360.auth.dto.LoginRequest;
import com.ps04.customer360.auth.dto.LoginResponse;
import com.ps04.customer360.auth.dto.MeResponse;
import com.ps04.customer360.security.AppPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null) clientIp = request.getRemoteAddr();

        LoginResponse res = authService.login(req, clientIp);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AppPrincipal principal) {
        authService.logout(principal);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal AppPrincipal principal) {
        MeResponse me = authService.getMe(principal);
        return ResponseEntity.ok(me);
    }
}
