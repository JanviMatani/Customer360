package com.ps04.customer360.review;

import com.ps04.customer360.review.model.ConflictQueueItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ConflictQueueRepo extends MongoRepository<ConflictQueueItem, String> {
    List<ConflictQueueItem> findByStatus(String status);
    List<ConflictQueueItem> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByRecordASourceCustomerIdAndRecordBSourceCustomerIdAndStatus(
            String cidA, String cidB, String status);
}
