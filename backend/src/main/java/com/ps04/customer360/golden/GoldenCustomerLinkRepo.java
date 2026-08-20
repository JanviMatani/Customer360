package com.ps04.customer360.golden;

import com.ps04.customer360.golden.model.GoldenCustomerLink;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GoldenCustomerLinkRepo extends MongoRepository<GoldenCustomerLink, String> {
    List<GoldenCustomerLink> findByGoldenId(String goldenId);
    Optional<GoldenCustomerLink> findByGoldenIdAndSourceSystem(String goldenId, String sourceSystem);
    boolean existsByGoldenIdAndSourceSystemAndSourceCustomerId(
            String goldenId, String sourceSystem, String sourceCustomerId);
    List<GoldenCustomerLink> findBySourceSystemAndSourceCustomerId(
            String sourceSystem, String sourceCustomerId);
}
