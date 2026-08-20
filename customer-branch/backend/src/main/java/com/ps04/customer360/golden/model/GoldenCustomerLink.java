package com.ps04.customer360.golden.model;

import com.ps04.customer360.matching.model.FieldEvidence;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "golden_customer_links")
public class GoldenCustomerLink {

    @Id
    private String id;

    @Indexed
    private String goldenId;

    private String sourceSystem;
    private String sourceCustomerId;

    private String matchMethod;
    private int matchConfidence;

    private List<FieldEvidence> evidence;

    private Instant linkedAt;
    private String approvedBy;

    public GoldenCustomerLink() {}

    public GoldenCustomerLink(String id, String goldenId, String sourceSystem, String sourceCustomerId, String matchMethod, int matchConfidence, List<FieldEvidence> evidence, Instant linkedAt, String approvedBy) {
        this.id = id;
        this.goldenId = goldenId;
        this.sourceSystem = sourceSystem;
        this.sourceCustomerId = sourceCustomerId;
        this.matchMethod = matchMethod;
        this.matchConfidence = matchConfidence;
        this.evidence = evidence;
        this.linkedAt = linkedAt;
        this.approvedBy = approvedBy;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String goldenId;
        private String sourceSystem;
        private String sourceCustomerId;
        private String matchMethod;
        private int matchConfidence;
        private List<FieldEvidence> evidence;
        private Instant linkedAt;
        private String approvedBy;

        public Builder id(String id) { this.id = id; return this; }
        public Builder goldenId(String goldenId) { this.goldenId = goldenId; return this; }
        public Builder sourceSystem(String sourceSystem) { this.sourceSystem = sourceSystem; return this; }
        public Builder sourceCustomerId(String sourceCustomerId) { this.sourceCustomerId = sourceCustomerId; return this; }
        public Builder matchMethod(String matchMethod) { this.matchMethod = matchMethod; return this; }
        public Builder matchConfidence(int matchConfidence) { this.matchConfidence = matchConfidence; return this; }
        public Builder evidence(List<FieldEvidence> evidence) { this.evidence = evidence; return this; }
        public Builder linkedAt(Instant linkedAt) { this.linkedAt = linkedAt; return this; }
        public Builder approvedBy(String approvedBy) { this.approvedBy = approvedBy; return this; }

        public GoldenCustomerLink build() {
            return new GoldenCustomerLink(id, goldenId, sourceSystem, sourceCustomerId, matchMethod, matchConfidence, evidence, linkedAt, approvedBy);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGoldenId() { return goldenId; }
    public void setGoldenId(String goldenId) { this.goldenId = goldenId; }

    public String getSourceSystem() { return sourceSystem; }
    public void setSourceSystem(String sourceSystem) { this.sourceSystem = sourceSystem; }

    public String getSourceCustomerId() { return sourceCustomerId; }
    public void setSourceCustomerId(String sourceCustomerId) { this.sourceCustomerId = sourceCustomerId; }

    public String getMatchMethod() { return matchMethod; }
    public void setMatchMethod(String matchMethod) { this.matchMethod = matchMethod; }

    public int getMatchConfidence() { return matchConfidence; }
    public void setMatchConfidence(int matchConfidence) { this.matchConfidence = matchConfidence; }

    public List<FieldEvidence> getEvidence() { return evidence; }
    public void setEvidence(List<FieldEvidence> evidence) { this.evidence = evidence; }

    public Instant getLinkedAt() { return linkedAt; }
    public void setLinkedAt(Instant linkedAt) { this.linkedAt = linkedAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
}
