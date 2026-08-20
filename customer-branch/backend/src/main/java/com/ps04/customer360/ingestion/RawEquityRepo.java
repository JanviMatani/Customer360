package com.ps04.customer360.ingestion;

import com.ps04.customer360.ingestion.model.RawEquityCustomer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RawEquityRepo extends MongoRepository<RawEquityCustomer, String> {
    Optional<RawEquityCustomer> findByNaturalKey(String naturalKey);
    List<RawEquityCustomer> findByNormalizedPan(String pan);
    List<RawEquityCustomer> findByNormalizedMobile(String mobile);
    List<RawEquityCustomer> findByNormalizedEmail(String email);
    java.util.Optional<RawEquityCustomer> findBySourceCustomerId(String sourceCustomerId);
}