package com.ps04.customer360.review;

import com.ps04.customer360.review.model.ConflictQueueItem;
import com.ps04.customer360.security.AppPrincipal;
import com.ps04.customer360.security.Audited;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ConflictQueueItem>> getReviewQueue(
            @RequestParam(required = false, defaultValue = "PENDING") String status) {
        List<ConflictQueueItem> queue = reviewService.getQueue(status);
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/{id}/decide")
    @Audited(action = "REVIEW_DECISION", targetType = "conflict")
    public ResponseEntity<ConflictQueueItem> decide(
            @AuthenticationPrincipal AppPrincipal principal,
            @PathVariable String id,
            @RequestBody ReviewService.DecisionRequest req) {

        ConflictQueueItem item = reviewService.decide(id, req, principal);
        return ResponseEntity.ok(item);
    }
}
