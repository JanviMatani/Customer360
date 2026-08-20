package com.ps04.customer360.review.model;

import com.ps04.customer360.matching.model.FieldEvidence;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "conflict_queue")
public class ConflictQueueItem {

    @Id
    private String id;

    @Indexed
    private String status;

    private SourceRef recordA;
    private SourceRef recordB;

    private int confidence;
    private List<FieldEvidence> evidence;

    private boolean isDangerousConflict;
    private String dangerReason;

    private String decidedBy;
    private Instant decidedAt;
    private String note;

    private Instant createdAt;

    public ConflictQueueItem() {}

    public ConflictQueueItem(String id, String status, SourceRef recordA, SourceRef recordB, int confidence, List<FieldEvidence> evidence, boolean isDangerousConflict, String dangerReason, String decidedBy, Instant decidedAt, String note, Instant createdAt) {
        this.id = id;
        this.status = status;
        this.recordA = recordA;
        this.recordB = recordB;
        this.confidence = confidence;
        this.evidence = evidence;
        this.isDangerousConflict = isDangerousConflict;
        this.dangerReason = dangerReason;
        this.decidedBy = decidedBy;
        this.decidedAt = decidedAt;
        this.note = note;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String status;
        private SourceRef recordA;
        private SourceRef recordB;
        private int confidence;
        private List<FieldEvidence> evidence;
        private boolean isDangerousConflict;
        private String dangerReason;
        private String decidedBy;
        private Instant decidedAt;
        private String note;
        private Instant createdAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder recordA(SourceRef recordA) { this.recordA = recordA; return this; }
        public Builder recordB(SourceRef recordB) { this.recordB = recordB; return this; }
        public Builder confidence(int confidence) { this.confidence = confidence; return this; }
        public Builder evidence(List<FieldEvidence> evidence) { this.evidence = evidence; return this; }
        public Builder isDangerousConflict(boolean isDangerousConflict) { this.isDangerousConflict = isDangerousConflict; return this; }
        public Builder dangerReason(String dangerReason) { this.dangerReason = dangerReason; return this; }
        public Builder decidedBy(String decidedBy) { this.decidedBy = decidedBy; return this; }
        public Builder decidedAt(Instant decidedAt) { this.decidedAt = decidedAt; return this; }
        public Builder note(String note) { this.note = note; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public ConflictQueueItem build() {
            return new ConflictQueueItem(id, status, recordA, recordB, confidence, evidence, isDangerousConflict, dangerReason, decidedBy, decidedAt, note, createdAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public SourceRef getRecordA() { return recordA; }
    public void setRecordA(SourceRef recordA) { this.recordA = recordA; }

    public SourceRef getRecordB() { return recordB; }
    public void setRecordB(SourceRef recordB) { this.recordB = recordB; }

    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }

    public List<FieldEvidence> getEvidence() { return evidence; }
    public void setEvidence(List<FieldEvidence> evidence) { this.evidence = evidence; }

    public boolean isDangerousConflict() { return isDangerousConflict; }
    public void setDangerousConflict(boolean dangerousConflict) { isDangerousConflict = dangerousConflict; }

    public String getDangerReason() { return dangerReason; }
    public void setDangerReason(String dangerReason) { this.dangerReason = dangerReason; }

    public String getDecidedBy() { return decidedBy; }
    public void setDecidedBy(String decidedBy) { this.decidedBy = decidedBy; }

    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class SourceRef {
        private String sourceSystem;
        private String sourceCustomerId;

        public SourceRef() {}

        public SourceRef(String sourceSystem, String sourceCustomerId) {
            this.sourceSystem = sourceSystem;
            this.sourceCustomerId = sourceCustomerId;
        }

        public String getSourceSystem() { return sourceSystem; }
        public void setSourceSystem(String sourceSystem) { this.sourceSystem = sourceSystem; }

        public String getSourceCustomerId() { return sourceCustomerId; }
        public void setSourceCustomerId(String sourceCustomerId) { this.sourceCustomerId = sourceCustomerId; }
    }
}
