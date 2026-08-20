package com.ps04.customer360.customer360;

import com.ps04.customer360.common.MaskingService;
import com.ps04.customer360.common.exception.NotFoundException;
import com.ps04.customer360.golden.GoldenCustomerLinkRepo;
import com.ps04.customer360.golden.GoldenCustomerRepo;
import com.ps04.customer360.golden.model.AttributeConflict;
import com.ps04.customer360.golden.model.GoldenCustomer;
import com.ps04.customer360.golden.model.GoldenCustomerLink;
import com.ps04.customer360.ingestion.RawEquityRepo;
import com.ps04.customer360.ingestion.RawInsuranceRepo;
import com.ps04.customer360.ingestion.RawLoanRepo;
import com.ps04.customer360.ingestion.RawMfRepo;
import com.ps04.customer360.ingestion.RawWealthRepo;
import com.ps04.customer360.matching.model.FieldEvidence;
import com.ps04.customer360.opportunity.OpportunityRepo;
import com.ps04.customer360.opportunity.model.Opportunity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class Customer360Service {

    private final GoldenCustomerRepo goldenCustomerRepo;
    private final GoldenCustomerLinkRepo goldenLinkRepo;
    private final OpportunityRepo opportunityRepo;
    private final RawEquityRepo equityRepo;
    private final RawMfRepo mfRepo;
    private final RawInsuranceRepo insuranceRepo;
    private final RawLoanRepo loanRepo;
    private final RawWealthRepo wealthRepo;
    private final MaskingService maskingService;

    public Customer360Service(GoldenCustomerRepo goldenCustomerRepo,
                              GoldenCustomerLinkRepo goldenLinkRepo,
                              OpportunityRepo opportunityRepo,
                              RawEquityRepo equityRepo, RawMfRepo mfRepo,
                              RawInsuranceRepo insuranceRepo, RawLoanRepo loanRepo,
                              RawWealthRepo wealthRepo, MaskingService maskingService) {
        this.goldenCustomerRepo = goldenCustomerRepo;
        this.goldenLinkRepo = goldenLinkRepo;
        this.opportunityRepo = opportunityRepo;
        this.equityRepo = equityRepo;
        this.mfRepo = mfRepo;
        this.insuranceRepo = insuranceRepo;
        this.loanRepo = loanRepo;
        this.wealthRepo = wealthRepo;
        this.maskingService = maskingService;
    }

    public static class Customer360Response {
        private String goldenId;
        private String name;
        private String dob;
        private String city;
        private String segment;
        private String pan;
        private String mobile;
        private String email;
        private List<String> linkedSources;
        private int matchConfidence;
        private Double totalRelationshipValue;
        private List<AttributeConflict> attributeConflicts;
        private List<ProductSummary> products;
        private List<FieldEvidence> evidenceTable;
        private List<Opportunity> opportunities;
        private List<SourceLineageItem> sourceLineage;

        public Customer360Response() {}

        public Customer360Response(String goldenId, String name, String dob, String city, String segment, String pan, String mobile, String email, List<String> linkedSources, int matchConfidence, Double totalRelationshipValue, List<AttributeConflict> attributeConflicts, List<ProductSummary> products, List<FieldEvidence> evidenceTable, List<Opportunity> opportunities, List<SourceLineageItem> sourceLineage) {
            this.goldenId = goldenId;
            this.name = name;
            this.dob = dob;
            this.city = city;
            this.segment = segment;
            this.pan = pan;
            this.mobile = mobile;
            this.email = email;
            this.linkedSources = linkedSources;
            this.matchConfidence = matchConfidence;
            this.totalRelationshipValue = totalRelationshipValue;
            this.attributeConflicts = attributeConflicts;
            this.products = products;
            this.evidenceTable = evidenceTable;
            this.opportunities = opportunities;
            this.sourceLineage = sourceLineage;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String goldenId;
            private String name;
            private String dob;
            private String city;
            private String segment;
            private String pan;
            private String mobile;
            private String email;
            private List<String> linkedSources;
            private int matchConfidence;
            private Double totalRelationshipValue;
            private List<AttributeConflict> attributeConflicts;
            private List<ProductSummary> products;
            private List<FieldEvidence> evidenceTable;
            private List<Opportunity> opportunities;
            private List<SourceLineageItem> sourceLineage;

            public Builder goldenId(String goldenId) { this.goldenId = goldenId; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder dob(String dob) { this.dob = dob; return this; }
            public Builder city(String city) { this.city = city; return this; }
            public Builder segment(String segment) { this.segment = segment; return this; }
            public Builder pan(String pan) { this.pan = pan; return this; }
            public Builder mobile(String mobile) { this.mobile = mobile; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder linkedSources(List<String> linkedSources) { this.linkedSources = linkedSources; return this; }
            public Builder matchConfidence(int matchConfidence) { this.matchConfidence = matchConfidence; return this; }
            public Builder totalRelationshipValue(Double totalRelationshipValue) { this.totalRelationshipValue = totalRelationshipValue; return this; }
            public Builder attributeConflicts(List<AttributeConflict> attributeConflicts) { this.attributeConflicts = attributeConflicts; return this; }
            public Builder products(List<ProductSummary> products) { this.products = products; return this; }
            public Builder evidenceTable(List<FieldEvidence> evidenceTable) { this.evidenceTable = evidenceTable; return this; }
            public Builder opportunities(List<Opportunity> opportunities) { this.opportunities = opportunities; return this; }
            public Builder sourceLineage(List<SourceLineageItem> sourceLineage) { this.sourceLineage = sourceLineage; return this; }

            public Customer360Response build() {
                return new Customer360Response(goldenId, name, dob, city, segment, pan, mobile, email, linkedSources, matchConfidence, totalRelationshipValue, attributeConflicts, products, evidenceTable, opportunities, sourceLineage);
            }
        }

        public String getGoldenId() { return goldenId; }
        public String getName() { return name; }
        public String getDob() { return dob; }
        public String getCity() { return city; }
        public String getSegment() { return segment; }
        public String getPan() { return pan; }
        public String getMobile() { return mobile; }
        public String getEmail() { return email; }
        public List<String> getLinkedSources() { return linkedSources; }
        public int getMatchConfidence() { return matchConfidence; }
        public Double getTotalRelationshipValue() { return totalRelationshipValue; }
        public List<AttributeConflict> getAttributeConflicts() { return attributeConflicts; }
        public List<ProductSummary> getProducts() { return products; }
        public List<FieldEvidence> getEvidenceTable() { return evidenceTable; }
        public List<Opportunity> getOpportunities() { return opportunities; }
        public List<SourceLineageItem> getSourceLineage() { return sourceLineage; }
    }

    public static class ProductSummary {
        private String product;
        private boolean exists;
        private Double relationshipValue;
        private String status;

        public ProductSummary() {}

        public ProductSummary(String product, boolean exists, Double relationshipValue, String status) {
            this.product = product;
            this.exists = exists;
            this.relationshipValue = relationshipValue;
            this.status = status;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String product;
            private boolean exists;
            private Double relationshipValue;
            private String status;

            public Builder product(String product) { this.product = product; return this; }
            public Builder exists(boolean exists) { this.exists = exists; return this; }
            public Builder relationshipValue(Double relationshipValue) { this.relationshipValue = relationshipValue; return this; }
            public Builder status(String status) { this.status = status; return this; }

            public ProductSummary build() {
                return new ProductSummary(product, exists, relationshipValue, status);
            }
        }

        public String getProduct() { return product; }
        public boolean isExists() { return exists; }
        public Double getRelationshipValue() { return relationshipValue; }
        public String getStatus() { return status; }
    }

    public static class SourceLineageItem {
        private String sourceSystem;
        private String sourceCustomerId;
        private Map<String, String> raw;
        private Object normalized;

        public SourceLineageItem() {}

        public SourceLineageItem(String sourceSystem, String sourceCustomerId, Map<String, String> raw, Object normalized) {
            this.sourceSystem = sourceSystem;
            this.sourceCustomerId = sourceCustomerId;
            this.raw = raw;
            this.normalized = normalized;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String sourceSystem;
            private String sourceCustomerId;
            private Map<String, String> raw;
            private Object normalized;

            public Builder sourceSystem(String sourceSystem) { this.sourceSystem = sourceSystem; return this; }
            public Builder sourceCustomerId(String sourceCustomerId) { this.sourceCustomerId = sourceCustomerId; return this; }
            public Builder raw(Map<String, String> raw) { this.raw = raw; return this; }
            public Builder normalized(Object normalized) { this.normalized = normalized; return this; }

            public SourceLineageItem build() {
                return new SourceLineageItem(sourceSystem, sourceCustomerId, raw, normalized);
            }
        }

        public String getSourceSystem() { return sourceSystem; }
        public String getSourceCustomerId() { return sourceCustomerId; }
        public Map<String, String> getRaw() { return raw; }
        public Object getNormalized() { return normalized; }
    }

    public Customer360Response getCustomer360(String goldenId, boolean maskSensitiveData) {
        GoldenCustomer golden = goldenCustomerRepo.findById(goldenId)
                .orElseThrow(() -> new NotFoundException("Golden Customer not found: " + goldenId));

        List<GoldenCustomerLink> links = goldenLinkRepo.findByGoldenId(goldenId);
        List<Opportunity> opportunities = opportunityRepo.findByGoldenId(goldenId);

        // Aggregate product holdings and source lineage
        List<ProductSummary> products = new ArrayList<>();
        List<SourceLineageItem> lineage = new ArrayList<>();
        List<FieldEvidence> combinedEvidence = new ArrayList<>();

        Set<String> presentSystems = new HashSet<>();

        for (GoldenCustomerLink link : links) {
            presentSystems.add(link.getSourceSystem());
            if (link.getEvidence() != null) {
                combinedEvidence.addAll(link.getEvidence());
            }

            SourceLineageItem lineageItem = fetchLineageItem(link.getSourceSystem(), link.getSourceCustomerId());
            if (lineageItem != null) {
                lineage.add(lineageItem);
            }
        }

        // Build product summary per system
        for (String sys : List.of("EQUITY", "MF", "INSURANCE", "WEALTH", "LOANS")) {
            boolean exists = presentSystems.contains(sys);
            Double val = 0.0;
            String status = exists ? "Active" : "None";

            if (exists) {
                ProductValAndStatus res = extractProductValueAndStatus(sys, lineage);
                val = res.val();
                status = res.status();
            }

            products.add(ProductSummary.builder()
                    .product(sys)
                    .exists(exists)
                    .relationshipValue(val)
                    .status(status)
                    .build());
        }

        return Customer360Response.builder()
                .goldenId(golden.getId())
                .name(golden.getName())
                .dob(golden.getDob())
                .city(golden.getCity())
                .segment(golden.getSegment())
                .pan(maskingService.maybeMaskPan(golden.getPrimaryPan(), maskSensitiveData))
                .mobile(maskingService.maybeMaskMobile(golden.getPrimaryMobile(), maskSensitiveData))
                .email(golden.getPrimaryEmail())
                .linkedSources(golden.getLinkedSources())
                .matchConfidence(golden.getMatchConfidence())
                .totalRelationshipValue(golden.getTotalRelationshipValue())
                .attributeConflicts(golden.getAttributeConflicts() != null ? golden.getAttributeConflicts() : List.of())
                .products(products)
                .evidenceTable(dedupeEvidence(combinedEvidence))
                .opportunities(opportunities)
                .sourceLineage(lineage)
                .build();
    }

    /**
     * Fetches a single source record by system+customerId using indexed lookup (not full scan).
     * Raw map is sanitized before returning: PAN and mobile are masked to prevent
     * sensitive values leaking through the lineage section of the Customer360 response.
     */
    private SourceLineageItem fetchLineageItem(String sys, String cid) {
        return switch (sys.toUpperCase()) {
            case "EQUITY" -> equityRepo.findBySourceCustomerId(cid)
                    .map(r -> new SourceLineageItem("EQUITY", cid, maskRawMap(r.getRaw()), r.getNormalized()))
                    .orElse(null);
            case "MF" -> mfRepo.findBySourceCustomerId(cid)
                    .map(r -> new SourceLineageItem("MF", cid, maskRawMap(r.getRaw()), r.getNormalized()))
                    .orElse(null);
            case "INSURANCE" -> insuranceRepo.findBySourceCustomerId(cid)
                    .map(r -> new SourceLineageItem("INSURANCE", cid, maskRawMap(r.getRaw()), r.getNormalized()))
                    .orElse(null);
            case "LOANS" -> loanRepo.findBySourceCustomerId(cid)
                    .map(r -> new SourceLineageItem("LOANS", cid, maskRawMap(r.getRaw()), r.getNormalized()))
                    .orElse(null);
            case "WEALTH" -> wealthRepo.findBySourceCustomerId(cid)
                    .map(r -> new SourceLineageItem("WEALTH", cid, maskRawMap(r.getRaw()), r.getNormalized()))
                    .orElse(null);
            default -> null;
        };
    }

    /**
     * Returns a copy of the raw map with PAN and mobile masked.
     * This prevents sensitive values from leaking through the sourceLineage
     * section of the Customer360 response — masking must happen server-side.
     */
    private Map<String, String> maskRawMap(Map<String, String> raw) {
        if (raw == null) return null;
        Map<String, String> masked = new LinkedHashMap<>(raw);
        if (masked.containsKey("pan")) {
            masked.put("pan", maskingService.maskPan(masked.get("pan")));
        }
        if (masked.containsKey("mobile")) {
            masked.put("mobile", maskingService.maskMobile(masked.get("mobile")));
        }
        // Also mask common alternate field names present in some source CSVs
        if (masked.containsKey("mobile_number")) {
            masked.put("mobile_number", maskingService.maskMobile(masked.get("mobile_number")));
        }
        return masked;
    }

    private record ProductValAndStatus(Double val, String status) {}

    private ProductValAndStatus extractProductValueAndStatus(String sys, List<SourceLineageItem> lineage) {
        double val = 0.0;
        String status = "Active";

        for (SourceLineageItem item : lineage) {
            if (sys.equalsIgnoreCase(item.getSourceSystem()) && item.getRaw() != null) {
                Map<String, String> raw = item.getRaw();
                for (String key : List.of("relationship_value", "aum", "equity_aum", "mf_aum", "sum_assured", "loan_amount")) {
                    if (raw.containsKey(key)) {
                        try {
                            val += Double.parseDouble(raw.get(key));
                            break;
                        } catch (NumberFormatException ignored) {}
                    }
                }
                for (String key : List.of("policy_status", "loan_status", "portfolio_status", "status")) {
                    if (raw.containsKey(key)) {
                        status = raw.get(key);
                        break;
                    }
                }
            }
        }
        return new ProductValAndStatus(val, status);
    }

    private List<FieldEvidence> dedupeEvidence(List<FieldEvidence> list) {
        Map<String, FieldEvidence> map = new LinkedHashMap<>();
        for (FieldEvidence fe : list) {
            map.putIfAbsent(fe.getField(), fe);
        }
        return new ArrayList<>(map.values());
    }
}
