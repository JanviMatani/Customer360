package com.ps04.customer360.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ps04.customer360.auth.dto.LoginRequest;
import com.ps04.customer360.auth.dto.LoginResponse;
import com.ps04.customer360.fixtures.DatasetFixtures;
import com.ps04.customer360.golden.GoldenCustomerRepo;
import com.ps04.customer360.golden.model.GoldenCustomer;
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
class CustomerControllerE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DatasetFixtures datasetFixtures;

    @Autowired
    private GoldenCustomerRepo goldenRepo;

    private String rmToken;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        datasetFixtures.loadRealDataset();

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
    void getCustomers_asRm_onlyReturnsOwnPortfolio() throws Exception {
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + rmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getCustomers_asAdmin_returnsAll() throws Exception {
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getCustomerById_unknownGoldenId_returns404() throws Exception {
        mockMvc.perform(get("/api/customers/CUST9999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCustomerById_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/customers/CUST0001"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void pagination_invalidPageSize_returns400() throws Exception {
        mockMvc.perform(get("/api/customers?pageSize=-1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }
}
