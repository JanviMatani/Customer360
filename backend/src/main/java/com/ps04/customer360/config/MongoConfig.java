package com.ps04.customer360.config;

import com.mongodb.client.MongoClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

/**
 * MongoConfig — adds a secondary MongoTemplate for the financial360 database
 * WITHOUT interfering with Spring Boot's primary auto-configured mongoTemplate.
 *
 * The @Primary + @ConditionalOnMissingBean ensure Spring Boot's own mongoTemplate
 * remains the primary bean used by all repositories.
 */
@Configuration
public class MongoConfig {

    /**
     * Explicitly re-declare the primary mongoTemplate pointing at customer360.
     * This prevents our financial360 bean from becoming the default.
     */
    @Bean
    @Primary
    @ConditionalOnMissingBean(name = "mongoTemplate")
    public MongoTemplate mongoTemplate(MongoDatabaseFactory factory) {
        return new MongoTemplate(factory);
    }

    /**
     * Secondary MongoTemplate pointing at financial360 database.
     * Used ONLY by AtlasIngestionService via @Qualifier("financial360MongoTemplate").
     */
    @Bean("financial360MongoTemplate")
    public MongoTemplate financial360MongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(
            new SimpleMongoClientDatabaseFactory(mongoClient, "financial360")
        );
    }
}
