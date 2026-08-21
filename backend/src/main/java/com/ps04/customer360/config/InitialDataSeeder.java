package com.ps04.customer360.config;

import com.ps04.customer360.auth.UserRepo;
import com.ps04.customer360.auth.model.User;
import com.ps04.customer360.config_rules.ConfigService;
import com.ps04.customer360.ingestion.IngestionService;
import com.ps04.customer360.ingestion.AtlasIngestionService;
import com.ps04.customer360.ingestion.RawEquityRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class InitialDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(InitialDataSeeder.class);

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;
    private final IngestionService ingestionService;
    private final AtlasIngestionService atlasIngestionService;
    private final RawEquityRepo equityRepo;

    public InitialDataSeeder(UserRepo userRepo, PasswordEncoder passwordEncoder,
                             MongoTemplate mongoTemplate, IngestionService ingestionService,
                             AtlasIngestionService atlasIngestionService,
                             RawEquityRepo equityRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.mongoTemplate = mongoTemplate;
        this.ingestionService = ingestionService;
        this.atlasIngestionService = atlasIngestionService;
        this.equityRepo = equityRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedDefaultConfigRules();
        seedDatasetIfEmpty();
    }

    public void seedUsers() {
        if (userRepo.count() == 0) {
            log.info("Seeding default system users...");

            // RM 101 - Anita Mehta
            userRepo.save(User.builder()
                    .email("rm.anita@bank.com")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .role("rm")
                    .rmId("RM101")
                    .failedLoginAttempts(0)
                    .build());

            // RM 106 - Rajesh Kumar
            userRepo.save(User.builder()
                    .email("rm.rajesh@bank.com")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .role("rm")
                    .rmId("RM106")
                    .failedLoginAttempts(0)
                    .build());

            // Manager - Vikram Shah (manages RM101 and RM102)
            userRepo.save(User.builder()
                    .email("manager.vikram@bank.com")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .role("manager")
                    .rmId("MGR01")
                    .managerOf(List.of("RM101", "RM102", "RM106"))
                    .failedLoginAttempts(0)
                    .build());

            // Admin - System Admin
            userRepo.save(User.builder()
                    .email("admin@bank.com")
                    .passwordHash(passwordEncoder.encode("Admin123!"))
                    .role("admin")
                    .failedLoginAttempts(0)
                    .build());

            log.info("Default users seeded successfully.");
        }
    }

    private void seedDefaultConfigRules() {
        if (!mongoTemplate.collectionExists("config_rules") || mongoTemplate.findAll(Map.class, "config_rules").isEmpty()) {
            log.info("Seeding default config rules...");

            Map<String, Object> weightsDoc = new HashMap<>(Map.of(
                    "_id", "match-weights-v1",
                    "type", "MATCH_WEIGHTS",
                    "weights", Map.of("pan", 40, "mobile", 25, "email", 15, "dob", 10, "name", 7, "city", 3),
                    "autoMergeThreshold", 85,
                    "manualReviewLowerThreshold", 60,
                    "hardConflictRules", List.of(
                            Map.of("id", "pan-dob-double-conflict", "active", true),
                            Map.of("id", "pan-name-mismatch", "active", true),
                            Map.of("id", "mobile-only-no-corroboration", "active", true)
                    ),
                    "version", 1
            ));
            mongoTemplate.save(weightsDoc, "config_rules");

            Map<String, Object> scoringWeights = new HashMap<>(Map.of(
                    "potential",            40,
                    "relationship",         25,
                    "recency",              20,
                    "engagement",           15,
                    "maxPotentialValue",    2000000,
                    "maxRelationshipValue", 2000000
            ));

            Map<String, Object> oppRulesDoc = new HashMap<>(Map.of(
                    "_id", "opportunity-rules-v1",
                    "type", "OPPORTUNITY_RULES",
                    "scoringWeights", scoringWeights,
                    "rules", List.of(
                            Map.of(
                                    "id", "insurance-cross-sell-v1",
                                    "product", "insurance",
                                    "conditions", List.of(
                                            Map.of("field", "equity.relationshipValue", "op", ">", "value", 500000),
                                            Map.of("field", "mf.relationshipValue", "op", ">", "value", 500000),
                                            Map.of("field", "insurance.exists", "op", "=", "value", false)
                                    ),
                                    "minScore", 65,
                                    "active", true
                            ),
                            Map.of(
                                    "id", "insurance-reengagement-v1",
                                    "product", "insurance",
                                    "conditions", List.of(
                                            Map.of("field", "insurance.exists", "op", "=", "value", true),
                                            Map.of("field", "insurance.policyStatus", "op", "=", "value", "LAPSED")
                                    ),
                                    "minScore", 55,
                                    "active", true
                            )
                    )
            ));
            mongoTemplate.save(oppRulesDoc, "config_rules");

            Map<String, Object> uiConfigDoc = new HashMap<>(Map.of(
                    "_id", "ui-config-v1",
                    "type", "UI_CONFIG",
                    "version", 1,
                    "dashboard", Map.of(
                            "widgets", List.of("pipeline-status", "opportunity-summary", "review-queue")
                    )
            ));
            mongoTemplate.save(uiConfigDoc, "config_rules");

            log.info("Default config rules seeded.");
        }
    }

    private void seedDatasetIfEmpty() {
        if (equityRepo.count() == 0) {
            log.info("Raw collections empty — trying Atlas financial360 collections first...");

            try {
                // PRIMARY: Read from Atlas financial360 database collections
                // (equity, mutual_funds, insurance, loans, wealth)
                int atlasCount = atlasIngestionService.ingestFromAtlas();

                if (atlasCount > 0) {
                    log.info("Successfully ingested {} records from Atlas financial360. Running matching pipeline...", atlasCount);
                    ingestionService.reloadAndMatchAll();
                    log.info("Atlas-based ingestion and matching completed.");
                    return;
                }

                log.info("Atlas financial360 collections empty or unreachable — falling back to classpath CSVs...");

            } catch (Exception e) {
                log.warn("Atlas ingestion failed: {} — falling back to CSV files", e.getMessage());
            }

            // FALLBACK: Read from bundled CSV files (original behaviour)
            try {
                PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
                Resource[] resources = resolver.getResources("classpath:data/*.csv");

                for (Resource r : resources) {
                    String filename = r.getFilename();
                    if (filename == null) continue;

                    String sys = switch (filename.toLowerCase()) {
                        case "equity.csv"       -> "EQUITY";
                        case "mutual_funds.csv" -> "MF";
                        case "insurance.csv"    -> "INSURANCE";
                        case "loans.csv"        -> "LOANS";
                        case "wealth.csv"       -> "WEALTH";
                        default -> null;
                    };

                    if (sys != null) {
                        ingestionService.ingestCsv(sys, r.getInputStream());
                        log.info("Ingested {}", filename);
                    }
                }

                ingestionService.reloadAndMatchAll();
                log.info("CSV fallback seeding and matching completed.");
            } catch (Exception e) {
                log.warn("Could not auto-seed from CSV files: {}", e.getMessage());
            }
        }
    }
}
