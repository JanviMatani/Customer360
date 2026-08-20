package com.ps04.customer360.ingestion;

import com.ps04.customer360.ingestion.model.RawMfCustomer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RawMfRepo extends MongoRepository<RawMfCustomer, String> {
    Optional<RawMfCustomer> findByNaturalKey(String naturalKey);
    List<RawMfCustomer> findByNormalizedPan(String pan);
    List<RawMfCustomer> findByNormalizedMobile(String mobile);
    List<RawMfCustomer> findByNormalizedEmail(String email);
}
