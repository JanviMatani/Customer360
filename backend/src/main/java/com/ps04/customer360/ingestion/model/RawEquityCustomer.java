package com.ps04.customer360.ingestion.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "raw_equity_customers")
public class RawEquityCustomer {

    @Id
    private String id;

    @Indexed(unique = true)
    private String naturalKey;

    private String sourceSystem = "EQUITY";
    private String sourceCustomerId;

    private Map<String, String> raw;
    private NormalizedFields normalized;

    private Instant ingestedAt;
    private String ingestBatchId;

    public RawEquityCustomer() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNaturalKey() { return naturalKey; }
    public void setNaturalKey(String naturalKey) { this.naturalKey = naturalKey; }

    public String getSourceSystem() { return sourceSystem; }
    public void setSourceSystem(String sourceSystem) { this.sourceSystem = sourceSystem; }

    public String getSourceCustomerId() { return sourceCustomerId; }
    public void setSourceCustomerId(String sourceCustomerId) { this.sourceCustomerId = sourceCustomerId; }

    public Map<String, String> getRaw() { return raw; }
    public void setRaw(Map<String, String> raw) { this.raw = raw; }

    public NormalizedFields getNormalized() { return normalized; }
    public void setNormalized(NormalizedFields normalized) { this.normalized = normalized; }

    public Instant getIngestedAt() { return ingestedAt; }
    public void setIngestedAt(Instant ingestedAt) { this.ingestedAt = ingestedAt; }

    public String getIngestBatchId() { return ingestBatchId; }
    public void setIngestBatchId(String ingestBatchId) { this.ingestBatchId = ingestBatchId; }
}
