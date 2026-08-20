package com.ps04.customer360.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ps04.customer360.auth.dto.LoginRequest;
import com.ps04.customer360.auth.dto.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ConfigControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String rmToken;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        rmToken = authenticate("rm.anita@bank.com", "Password123!");
        adminToken = authenticate("admin@bank.com", "Admin123!");
    }

    private String authenticate(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword(password);

        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        LoginResponse loginRes = objectMapper.readValue(res.getResponse().getContentAsString(), LoginResponse.class);
        return loginRes.getToken();
    }

    @Test
    void get_asRm_readOnlyAllowed() throws Exception {
        mockMvc.perform(get("/api/config")
                        .header("Authorization", "Bearer " + rmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weights").exists());
    }

    @Test
    void put_asRm_forbidden() throws Exception {
        Map<String, Object> body = Map.of("autoMergeThreshold", 90);

        mockMvc.perform(put("/api/config")
                        .header("Authorization", "Bearer " + rmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void put_asAdmin_weightsSumNot100_returns400() throws Exception {
        Map<String, Object> body = Map.of(
                "weights", Map.of("pan", 40, "mobile", 20), // sum = 60
                "autoMergeThreshold", 85,
                "manualReviewLowerThreshold", 60
        );

        mockMvc.perform(put("/api/config")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void put_asAdmin_reviewThresholdAboveAutoMerge_returns400() throws Exception {
        Map<String, Object> body = Map.of(
                "weights", Map.of("pan", 40, "mobile", 25, "email", 15, "dob", 10, "name", 7, "city", 3),
                "autoMergeThreshold", 80,
                "manualReviewLowerThreshold", 90 // inverted!
        );

        mockMvc.perform(put("/api/config")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }
}
