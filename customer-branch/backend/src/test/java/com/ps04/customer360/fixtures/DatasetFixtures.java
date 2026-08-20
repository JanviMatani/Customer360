package com.ps04.customer360.fixtures;

import com.ps04.customer360.ingestion.IngestionService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

@Component
public class DatasetFixtures {

    private final IngestionService ingestionService;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;
    private final com.ps04.customer360.config.InitialDataSeeder initialDataSeeder;

    public DatasetFixtures(IngestionService ingestionService, 
                           org.springframework.data.mongodb.core.MongoTemplate mongoTemplate,
                           com.ps04.customer360.config.InitialDataSeeder initialDataSeeder) {
        this.ingestionService = ingestionService;
        this.mongoTemplate = mongoTemplate;
        this.initialDataSeeder = initialDataSeeder;
    }

    public void loadRealDataset() throws Exception {
        mongoTemplate.getDb().drop();
        initialDataSeeder.seedUsers();
        com.ps04.customer360.golden.GoldenCustomerService.resetIdCounter();

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:data/*.csv");

        for (Resource r : resources) {
            String filename = r.getFilename();
            if (filename == null) continue;

            String sys = switch (filename.toLowerCase()) {
                case "equity.csv" -> "EQUITY";
                case "mutual_funds.csv" -> "MF";
                case "insurance.csv" -> "INSURANCE";
                case "loans.csv" -> "LOANS";
                case "wealth.csv" -> "WEALTH";
                default -> null;
            };

            if (sys != null) {
                ingestionService.ingestCsv(sys, r.getInputStream());
            }
        }

        // Run matching pipeline
        ingestionService.reloadAndMatchAll();
    }
}
