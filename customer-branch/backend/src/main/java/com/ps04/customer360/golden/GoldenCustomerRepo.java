package com.ps04.customer360.golden;

import com.ps04.customer360.golden.model.GoldenCustomer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GoldenCustomerRepo extends MongoRepository<GoldenCustomer, String> {
    Optional<GoldenCustomer> findByPrimaryPan(String pan);
    List<GoldenCustomer> findByRmId(String rmId);
    List<GoldenCustomer> findByRmIdIn(List<String> rmIds);
    Page<GoldenCustomer> findByRmId(String rmId, Pageable pageable);
    Page<GoldenCustomer> findByRmIdIn(List<String> rmIds, Pageable pageable);
    Page<GoldenCustomer> findByCityIgnoreCase(String city, Pageable pageable);
    long countByRmId(String rmId);
    long countByRmIdIn(List<String> rmIds);
}
