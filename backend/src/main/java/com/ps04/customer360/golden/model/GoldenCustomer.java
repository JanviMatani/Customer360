package com.ps04.customer360.golden.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Persistable;

@Document(collection = "golden_customers")
public class GoldenCustomer {

    @Id
    private String id;
    private String name;
    private String dob;
    private String city;
    private String segment;

    @Indexed
    private String primaryPan;

    @Indexed
    private String primaryMobile;
    private String primaryEmail;

    private List<String> linkedSources;
    private int matchConfidence;
    private Double totalRelationshipValue;
    private List<AttributeConflict> attributeConflicts;

    @Indexed
    private String rmId;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;

    @Version
    private Long version;

    public GoldenCustomer() {}

    public GoldenCustomer(String id, String name, String dob, String city, String segment, String primaryPan, String primaryMobile, String primaryEmail, List<String> linkedSources, int matchConfidence, Double totalRelationshipValue, List<AttributeConflict> attributeConflicts, String rmId, Instant createdAt, Instant updatedAt, String createdBy, Long version) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.city = city;
        this.segment = segment;
        this.primaryPan = primaryPan;
        this.primaryMobile = primaryMobile;
        this.primaryEmail = primaryEmail;
        this.linkedSources = linkedSources;
        this.matchConfidence = matchConfidence;
        this.totalRelationshipValue = totalRelationshipValue;
        this.attributeConflicts = attributeConflicts;
        this.rmId = rmId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.version = version;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String name;
        private String dob;
        private String city;
        private String segment;
        private String primaryPan;
        private String primaryMobile;
        private String primaryEmail;
        private List<String> linkedSources;
        private int matchConfidence;
        private Double totalRelationshipValue;
        private List<AttributeConflict> attributeConflicts;
        private String rmId;
        private Instant createdAt;
        private Instant updatedAt;
        private String createdBy;
        private Long version;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder dob(String dob) { this.dob = dob; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder segment(String segment) { this.segment = segment; return this; }
        public Builder primaryPan(String primaryPan) { this.primaryPan = primaryPan; return this; }
        public Builder primaryMobile(String primaryMobile) { this.primaryMobile = primaryMobile; return this; }
        public Builder primaryEmail(String primaryEmail) { this.primaryEmail = primaryEmail; return this; }
        public Builder linkedSources(List<String> linkedSources) { this.linkedSources = linkedSources; return this; }
        public Builder matchConfidence(int matchConfidence) { this.matchConfidence = matchConfidence; return this; }
        public Builder totalRelationshipValue(Double totalRelationshipValue) { this.totalRelationshipValue = totalRelationshipValue; return this; }
        public Builder attributeConflicts(List<AttributeConflict> attributeConflicts) { this.attributeConflicts = attributeConflicts; return this; }
        public Builder rmId(String rmId) { this.rmId = rmId; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public Builder version(Long version) { this.version = version; return this; }

        public GoldenCustomer build() {
            return new GoldenCustomer(id, name, dob, city, segment, primaryPan, primaryMobile, primaryEmail, linkedSources, matchConfidence, totalRelationshipValue, attributeConflicts, rmId, createdAt, updatedAt, createdBy, version);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public String getPrimaryPan() { return primaryPan; }
    public void setPrimaryPan(String primaryPan) { this.primaryPan = primaryPan; }

    public String getPrimaryMobile() { return primaryMobile; }
    public void setPrimaryMobile(String primaryMobile) { this.primaryMobile = primaryMobile; }

    public String getPrimaryEmail() { return primaryEmail; }
    public void setPrimaryEmail(String primaryEmail) { this.primaryEmail = primaryEmail; }

    public List<String> getLinkedSources() { return linkedSources; }
    public void setLinkedSources(List<String> linkedSources) { this.linkedSources = linkedSources; }

    public int getMatchConfidence() { return matchConfidence; }
    public void setMatchConfidence(int matchConfidence) { this.matchConfidence = matchConfidence; }

    public Double getTotalRelationshipValue() { return totalRelationshipValue; }
    public void setTotalRelationshipValue(Double totalRelationshipValue) { this.totalRelationshipValue = totalRelationshipValue; }

    public List<AttributeConflict> getAttributeConflicts() { return attributeConflicts; }
    public void setAttributeConflicts(List<AttributeConflict> attributeConflicts) { this.attributeConflicts = attributeConflicts; }

    public String getRmId() { return rmId; }
    public void setRmId(String rmId) { this.rmId = rmId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
