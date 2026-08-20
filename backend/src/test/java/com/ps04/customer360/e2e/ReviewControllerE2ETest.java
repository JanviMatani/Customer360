package com.ps04.customer360.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ps04.customer360.auth.dto.LoginRequest;
import com.ps04.customer360.auth.dto.LoginResponse;
import com.ps04.customer360.fixtures.DatasetFixtures;
import com.ps04.customer360.review.ConflictQueueRepo;
import com.ps04.customer360.review.ReviewService;
import com.ps04.customer360.review.model.ConflictQueueItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReviewControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DatasetFixtures datasetFixtures;

    @Autowired
    private ConflictQueueRepo conflictRepo;

    private String rmToken;
    private String managerToken;

    @BeforeEach
    void setUp() throws Exception {
        datasetFixtures.loadRealDataset();
        rmToken = authenticate("rm.anita@bank.com", "Password123!");
        managerToken = authenticate("manager.vikram@bank.com", "Password123!");
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
    void getReviewQueue_asManager_succeeds() throws Exception {
        mockMvc.perform(get("/api/review")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getReviewQueue_asRm_returns403() throws Exception {
        mockMvc.perform(get("/api/review")
                        .header("Authorization", "Bearer " + rmToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void decide_unknownConflictId_returns404() throws Exception {
        ReviewService.DecisionRequest req = new ReviewService.DecisionRequest();
        req.setDecision("MERGE");

        mockMvc.perform(post("/api/review/BOGUS_ID/decide")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }
}
