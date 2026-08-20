package com.ps04.customer360.opportunity;

import com.ps04.customer360.opportunity.model.Opportunity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OpportunityRepo extends MongoRepository<Opportunity, String> {
    List<Opportunity> findByGoldenId(String goldenId);
    Optional<Opportunity> findByGoldenIdAndRuleId(String goldenId, String ruleId);
    Page<Opportunity> findByRmId(String rmId, Pageable pageable);
    Page<Opportunity> findByRmIdIn(List<String> rmIds, Pageable pageable);
    Page<Opportunity> findByProduct(String product, Pageable pageable);
    Page<Opportunity> findByRmIdAndProduct(String rmId, String product, Pageable pageable);
    Page<Opportunity> findByRmIdInAndProduct(List<String> rmIds, String product, Pageable pageable);
    long countByStatus(String status);
    long countByRmIdAndStatus(String rmId, String status);
    long countByRmIdInAndStatus(List<String> rmIds, String status);
}
