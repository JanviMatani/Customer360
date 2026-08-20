package com.ps04.customer360.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ps04.customer360.auth.dto.LoginRequest;
import com.ps04.customer360.auth.dto.LoginResponse;
import com.ps04.customer360.fixtures.DatasetFixtures;
import com.ps04.customer360.opportunity.OpportunityController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpportunityControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DatasetFixtures datasetFixtures;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        datasetFixtures.loadRealDataset();
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
    void list_asAdmin_returnsPaginatedList() throws Exception {
        mockMvc.perform(get("/api/opportunities")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void patchStatus_unknownId_returns404() throws Exception {
        OpportunityController.StatusUpdateRequest req = new OpportunityController.StatusUpdateRequest();
        req.setStatus("in_progress");

        mockMvc.perform(patch("/api/opportunities/BOGUS_ID/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }
}
