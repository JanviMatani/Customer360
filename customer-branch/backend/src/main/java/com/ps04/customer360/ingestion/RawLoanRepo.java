package com.ps04.customer360.ingestion;

import com.ps04.customer360.ingestion.model.RawLoanCustomer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RawLoanRepo extends MongoRepository<RawLoanCustomer, String> {
    Optional<RawLoanCustomer> findByNaturalKey(String naturalKey);
    List<RawLoanCustomer> findByNormalizedPan(String pan);
    List<RawLoanCustomer> findByNormalizedMobile(String mobile);
    List<RawLoanCustomer> findByNormalizedEmail(String email);
    java.util.Optional<RawLoanCustomer> findBySourceCustomerId(String sourceCustomerId);
}