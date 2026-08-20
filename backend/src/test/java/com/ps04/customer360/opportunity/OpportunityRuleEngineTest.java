package com.ps04.customer360.opportunity;

import com.ps04.customer360.audit.AuditService;
import com.ps04.customer360.config_rules.ConfigService;
import com.ps04.customer360.customer360.Customer360Service;
import com.ps04.customer360.customer360.Customer360Service.Customer360Response;
import com.ps04.customer360.customer360.Customer360Service.ProductSummary;
import com.ps04.customer360.golden.GoldenCustomerRepo;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.opportunity.model.Opportunity;
import com.ps04.customer360.opportunity.model.OpportunityRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

class OpportunityRuleEngineTest {

    private OpportunityRuleEngine engine;
    private StubGoldenCustomerRepo goldenRepo;
    private StubCustomer360Service c360Service;
    private StubOpportunityRepo oppRepo;
    private StubConfigService configService;
    private StubAuditService auditService;

    @BeforeEach
    void setUp() {
        goldenRepo = new StubGoldenCustomerRepo();
        c360Service = new StubCustomer360Service();
        oppRepo = new StubOpportunityRepo();
        configService = new StubConfigService();
        auditService = new StubAuditService();

        engine = new OpportunityRuleEngine(goldenRepo, c360Service, oppRepo, configService, new OpportunityScoringService(configService), auditService);

        OpportunityRule rule1 = OpportunityRule.builder()
                .id("insurance-cross-sell-v1")
                .product("insurance")
                .conditions(List.of(
                        OpportunityRule.RuleCondition.builder().field("equity.relationshipValue").op(">").value(500000).build(),
                        OpportunityRule.RuleCondition.builder().field("mf.relationshipValue").op(">").value(500000).build(),
                        OpportunityRule.RuleCondition.builder().field("insurance.exists").op("=").value(false).build()
                ))
                .minScore(65)
                .active(true)
                .build();

        OpportunityRule rule2 = OpportunityRule.builder()
                .id("insurance-reengagement-v1")
                .product("insurance")
                .conditions(List.of(
                        OpportunityRule.RuleCondition.builder().field("insurance.exists").op("=").value(true).build(),
                        OpportunityRule.RuleCondition.builder().field("insurance.policyStatus").op("=").value("LAPSED").build()
                ))
                .minScore(55)
                .active(true)
                .build();

        configService.rules = List.of(rule1, rule2);
    }

    @Test
    void noInsuranceHighEquityAndMf_generatesInsuranceOpportunity() {
        String goldenId = "CUST_ISHITA";
        goldenRepo.store.put(goldenId, GoldenCustomer.builder().id(goldenId).name("Ishita Rao").rmId("RM101").build());

        c360Service.responses.put(goldenId, Customer360Response.builder()
                .goldenId(goldenId)
                .totalRelationshipValue(1600000.0)
                .products(List.of(
                        ProductSummary.builder().product("EQUITY").exists(true).relationshipValue(620000.0).status("Active").build(),
                        ProductSummary.builder().product("MF").exists(true).relationshipValue(980000.0).status("Active").build(),
                        ProductSummary.builder().product("INSURANCE").exists(false).relationshipValue(0.0).status("None").build()
                ))
                .build());

        List<Opportunity> opps = engine.evaluateOpportunitiesForCustomer(goldenId);

        assertThat(opps).hasSize(1);
        assertThat(opps.get(0).getProduct()).isEqualTo("insurance");
        assertThat(opps.get(0).getRuleId()).isEqualTo("insurance-cross-sell-v1");
        assertThat(opps.get(0).getReasons()).isNotEmpty();
    }

    @Test
    void lapsedInsurance_generatesReengagementNotCrossSell() {
        String goldenId = "CUST_VIVEK";
        goldenRepo.store.put(goldenId, GoldenCustomer.builder().id(goldenId).name("Vivek Menon").rmId("RM101").build());

        c360Service.responses.put(goldenId, Customer360Response.builder()
                .goldenId(goldenId)
                .totalRelationshipValue(2200000.0)
                .products(List.of(
                        ProductSummary.builder().product("INSURANCE").exists(true).relationshipValue(750000.0).status("LAPSED").build()
                ))
                .build());

        List<Opportunity> opps = engine.evaluateOpportunitiesForCustomer(goldenId);

        assertThat(opps).hasSize(1);
        assertThat(opps.get(0).getRuleId()).isEqualTo("insurance-reengagement-v1");
    }

    @Test
    void fullyBankedCustomer_generatesNoOpportunities() {
        String goldenId = "CUST_DEV";
        goldenRepo.store.put(goldenId, GoldenCustomer.builder().id(goldenId).name("Dev Malhotra").rmId("RM101").build());

        c360Service.responses.put(goldenId, Customer360Response.builder()
                .goldenId(goldenId)
                .totalRelationshipValue(11500000.0)
                .products(List.of(
                        ProductSummary.builder().product("EQUITY").exists(true).relationshipValue(2500000.0).status("Active").build(),
                        ProductSummary.builder().product("MF").exists(true).relationshipValue(3000000.0).status("Active").build(),
                        ProductSummary.builder().product("INSURANCE").exists(true).relationshipValue(5000000.0).status("Active").build(),
                        ProductSummary.builder().product("WEALTH").exists(true).relationshipValue(4500000.0).status("Active").build(),
                        ProductSummary.builder().product("LOANS").exists(true).relationshipValue(1500000.0).status("Active").build()
                ))
                .build());

        List<Opportunity> opps = engine.evaluateOpportunitiesForCustomer(goldenId);

        assertThat(opps).isEmpty();
    }

    // ── Stub Helpers ────────────────────────────────────────────────────────

    private static class StubConfigService extends ConfigService {
        List<OpportunityRule> rules = new ArrayList<>();
        public StubConfigService() { super(null); }
        @Override public List<OpportunityRule> getOpportunityRules() { return rules; }
        @Override public java.util.Map<String, Object> getScoringWeights() {
            return java.util.Map.of(
                "potential", 40, "relationship", 25, "recency", 20, "engagement", 15,
                "maxPotentialValue", 2000000, "maxRelationshipValue", 2000000
            );
        }
    }

    private static class StubCustomer360Service extends Customer360Service {
        Map<String, Customer360Response> responses = new HashMap<>();
        public StubCustomer360Service() { super(null, null, null, null, null, null, null, null, null); }
        @Override public Customer360Response getCustomer360(String goldenId, boolean mask) { return responses.get(goldenId); }
    }

    private static class StubAuditService extends AuditService {
        public StubAuditService() { super(null); }
        @Override public void log(String actorId, String actorRole, String action, String targetType, String targetId, Map<String, Object> before, Map<String, Object> after, String ip, String description) {}
        @Override public void log(String actorId, String actorRole, String action, String targetType, String targetId, String description) {}
    }

    private static class StubGoldenCustomerRepo implements GoldenCustomerRepo {
        Map<String, GoldenCustomer> store = new HashMap<>();
        @Override public Optional<GoldenCustomer> findById(String s) { return Optional.ofNullable(store.get(s)); }
        @Override public Optional<GoldenCustomer> findByPrimaryPan(String pan) { return Optional.empty(); }
        @Override public List<GoldenCustomer> findByRmId(String rmId) { return List.of(); }
        @Override public List<GoldenCustomer> findByRmIdIn(List<String> rmIds) { return List.of(); }
        @Override public org.springframework.data.domain.Page<GoldenCustomer> findByRmId(String rmId, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public org.springframework.data.domain.Page<GoldenCustomer> findByRmIdIn(List<String> rmIds, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public org.springframework.data.domain.Page<GoldenCustomer> findByCityIgnoreCase(String city, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public long countByRmId(String rmId) { return 0; }
        @Override public long countByRmIdIn(List<String> rmIds) { return 0; }
        @Override public <S extends GoldenCustomer> S save(S entity) { store.put(entity.getId(), entity); return entity; }
        @Override public <S extends GoldenCustomer> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<GoldenCustomer> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<GoldenCustomer> findAllById(Iterable<String> strings) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(String s) {}
        @Override public void delete(GoldenCustomer entity) {}
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends GoldenCustomer> entities) {}
        @Override public void deleteAll() {}
        @Override public boolean existsById(String s) { return store.containsKey(s); }
        @Override public <S extends GoldenCustomer> List<S> insert(Iterable<S> entities) { return List.of(); }
        @Override public <S extends GoldenCustomer> S insert(S entity) { return entity; }
        @Override public <S extends GoldenCustomer> List<S> findAll(org.springframework.data.domain.Example<S> example) { return List.of(); }
        @Override public <S extends GoldenCustomer> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return List.of(); }
        @Override public <S extends GoldenCustomer> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends GoldenCustomer> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends GoldenCustomer> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends GoldenCustomer, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<GoldenCustomer> findAll(org.springframework.data.domain.Sort sort) { return List.of(); }
        @Override public org.springframework.data.domain.Page<GoldenCustomer> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends GoldenCustomer> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
    }

    private static class StubOpportunityRepo implements OpportunityRepo {
        Map<String, Opportunity> store = new HashMap<>();
        @Override public Optional<Opportunity> findByGoldenIdAndRuleId(String goldenId, String ruleId) {
            return store.values().stream().filter(o -> goldenId.equals(o.getGoldenId()) && ruleId.equals(o.getRuleId())).findFirst();
        }
        @Override public List<Opportunity> findByGoldenId(String goldenId) { return store.values().stream().filter(o -> goldenId.equals(o.getGoldenId())).toList(); }
        @Override public org.springframework.data.domain.Page<Opportunity> findByRmId(String rmId, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public org.springframework.data.domain.Page<Opportunity> findByRmIdIn(List<String> rmIds, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public org.springframework.data.domain.Page<Opportunity> findByProduct(String product, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public org.springframework.data.domain.Page<Opportunity> findByRmIdAndProduct(String rmId, String product, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public org.springframework.data.domain.Page<Opportunity> findByRmIdInAndProduct(List<String> rmIds, String product, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public long countByStatus(String status) { return 0; }
        @Override public long countByRmIdAndStatus(String rmId, String status) { return 0; }
        @Override public long countByRmIdInAndStatus(List<String> rmIds, String status) { return 0; }
        @Override public <S extends Opportunity> S save(S entity) {
            if (entity.getId() == null) entity.setId(UUID.randomUUID().toString());
            store.put(entity.getId(), entity);
            return entity;
        }
        @Override public <S extends Opportunity> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public Optional<Opportunity> findById(String s) { return Optional.ofNullable(store.get(s)); }
        @Override public boolean existsById(String s) { return store.containsKey(s); }
        @Override public List<Opportunity> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<Opportunity> findAllById(Iterable<String> strings) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(String s) {}
        @Override public void delete(Opportunity entity) {}
        @Override public void deleteAllById(Iterable<? extends String> strings) {}
        @Override public void deleteAll(Iterable<? extends Opportunity> entities) {}
        @Override public void deleteAll() {}
        @Override public <S extends Opportunity> List<S> insert(Iterable<S> entities) { return List.of(); }
        @Override public <S extends Opportunity> S insert(S entity) { return entity; }
        @Override public <S extends Opportunity> List<S> findAll(org.springframework.data.domain.Example<S> example) { return List.of(); }
        @Override public <S extends Opportunity> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return List.of(); }
        @Override public <S extends Opportunity> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends Opportunity> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends Opportunity> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends Opportunity, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<Opportunity> findAll(org.springframework.data.domain.Sort sort) { return List.of(); }
        @Override public org.springframework.data.domain.Page<Opportunity> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends Opportunity> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
    }
}
