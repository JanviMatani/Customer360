package com.ps04.customer360.ingestion;

import com.ps04.customer360.ingestion.model.RawInsuranceCustomer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RawInsuranceRepo extends MongoRepository<RawInsuranceCustomer, String> {
    Optional<RawInsuranceCustomer> findByNaturalKey(String naturalKey);
    List<RawInsuranceCustomer> findByNormalizedPan(String pan);
    List<RawInsuranceCustomer> findByNormalizedMobile(String mobile);
    List<RawInsuranceCustomer> findByNormalizedEmail(String email);
    java.util.Optional<RawInsuranceCustomer> findBySourceCustomerId(String sourceCustomerId);
}