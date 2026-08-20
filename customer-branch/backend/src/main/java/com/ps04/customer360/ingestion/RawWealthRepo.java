package com.ps04.customer360.ingestion;

import com.ps04.customer360.ingestion.model.RawWealthCustomer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RawWealthRepo extends MongoRepository<RawWealthCustomer, String> {
    Optional<RawWealthCustomer> findByNaturalKey(String naturalKey);
    List<RawWealthCustomer> findByNormalizedPan(String pan);
    List<RawWealthCustomer> findByNormalizedMobile(String mobile);
    List<RawWealthCustomer> findByNormalizedEmail(String email);
    java.util.Optional<RawWealthCustomer> findBySourceCustomerId(String sourceCustomerId);
}