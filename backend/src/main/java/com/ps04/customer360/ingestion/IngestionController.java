package com.ps04.customer360.ingestion;

import com.ps04.customer360.ingestion.IngestionService;
import com.ps04.customer360.opportunity.OpportunityRuleEngine;
import com.ps04.customer360.security.Audited;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class IngestionController {

    private final IngestionService ingestionService;
    private final OpportunityRuleEngine opportunityRuleEngine;

    public IngestionController(IngestionService ingestionService, OpportunityRuleEngine opportunityRuleEngine) {
        this.ingestionService = ingestionService;
        this.opportunityRuleEngine = opportunityRuleEngine;
    }

    @PostMapping("/ingest/reload")
    @Audited(action = "INGEST_RELOAD", targetType = "pipeline")
    public ResponseEntity<Map<String, Object>> reloadIngestion() {
        int pairs = ingestionService.reloadAndMatchAll();
        opportunityRuleEngine.recomputeAllOpportunities();
        return ResponseEntity.ok(Map.of("message", "Reload and rematch completed successfully", "evaluatedPairs", pairs));
    }

    @PostMapping("/rematch")
    @Audited(action = "REMATCH_ALL", targetType = "pipeline")
    public ResponseEntity<Map<String, Object>> rematch() {
        int pairs = ingestionService.reloadAndMatchAll();
        return ResponseEntity.ok(Map.of("message", "Rematch completed successfully", "evaluatedPairs", pairs));
    }

    @PostMapping("/opportunities/recompute")
    @Audited(action = "OPPORTUNITIES_RECOMPUTE", targetType = "opportunities")
    public ResponseEntity<Map<String, Object>> recomputeOpportunities() {
        int count = opportunityRuleEngine.recomputeAllOpportunities();
        return ResponseEntity.ok(Map.of("message", "Opportunities recomputed successfully", "generatedOpportunities", count));
    }
}
