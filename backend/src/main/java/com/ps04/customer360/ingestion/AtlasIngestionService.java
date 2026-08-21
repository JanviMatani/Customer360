package com.ps04.customer360.ingestion;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * AtlasIngestionService — reads raw customer records directly from the
 * financial360 Atlas MongoDB collections (equity, mutual_funds, insurance,
 * loans, wealth) and feeds them into the existing IngestionService pipeline.
 *
 * Uses a dedicated MongoTemplate bean pointing at financial360 database,
 * separate from the main application database (customer360).
 */
@Service
public class AtlasIngestionService {

    private static final Logger log = LoggerFactory.getLogger(AtlasIngestionService.class);

    /** Points at financial360 database — source data only */
    private final MongoTemplate financial360Template;

    private final IngestionService ingestionService;

    // financial360 collection name → pipeline system name
    private static final List<Map.Entry<String, String>> COLLECTIONS = List.of(
        Map.entry("equity",       "EQUITY"),
        Map.entry("mutual_funds", "MF"),
        Map.entry("insurance",    "INSURANCE"),
        Map.entry("loans",        "LOANS"),
        Map.entry("wealth",       "WEALTH")
    );

    public AtlasIngestionService(
            @Qualifier("financial360MongoTemplate") MongoTemplate financial360Template,
            IngestionService ingestionService) {
        this.financial360Template = financial360Template;
        this.ingestionService     = ingestionService;
    }

    /**
     * Ingest all records from the financial360 Atlas collections.
     * Each document is converted to Map<String,String> and fed into
     * the existing saveRawRecord pipeline via ingestFromMap().
     *
     * @return total records ingested across all 5 systems
     */
    public int ingestFromAtlas() {
        int total = 0;

        // Check which collections exist in financial360
        List<String> existingCollections;
        try {
            existingCollections = financial360Template.getDb()
                    .listCollectionNames()
                    .into(new ArrayList<>());
        } catch (Exception e) {
            log.error("Cannot list financial360 collections: {}", e.getMessage());
            return 0;
        }

        for (Map.Entry<String, String> entry : COLLECTIONS) {
            String collectionName = entry.getKey();
            String systemName     = entry.getValue();

            if (!existingCollections.contains(collectionName)) {
                log.warn("Collection '{}' not found in financial360 database — skipping", collectionName);
                continue;
            }

            try {
                List<Document> docs = financial360Template
                        .getCollection(collectionName)
                        .find()
                        .into(new ArrayList<>());

                log.info("Reading {} records from financial360.{}", docs.size(), collectionName);

                for (Document doc : docs) {
                    Map<String, String> rawMap = documentToStringMap(doc, systemName);
                    if (rawMap.isEmpty()) continue;
                    ingestionService.ingestFromMap(systemName, rawMap);
                    total++;
                }

                log.info("Ingested {} records from financial360.{}", docs.size(), collectionName);

            } catch (Exception e) {
                log.error("Failed to ingest from financial360.{}: {}", collectionName, e.getMessage());
            }
        }

        log.info("Atlas ingestion complete — {} total records", total);
        return total;
    }

    /**
     * Converts a BSON Document to Map<String,String>.
     * - Skips _id and null values
     * - Converts Date objects to yyyy-MM-dd
     * - Adds canonical "relationship_value" mapping for system-specific balance fields
     */
    private Map<String, String> documentToStringMap(Document doc, String systemName) {
        Map<String, String> result = new LinkedHashMap<>();
        SimpleDateFormat dateFmt = new SimpleDateFormat("yyyy-MM-dd");

        for (Map.Entry<String, Object> entry : doc.entrySet()) {
            String key   = entry.getKey();
            Object value = entry.getValue();

            if ("_id".equals(key) || value == null) continue;

            String strValue;
            if (value instanceof org.bson.types.ObjectId) {
                continue; // skip MongoDB ObjectId
            } else if (value instanceof Date d) {
                strValue = dateFmt.format(d);
            } else if (value instanceof Number n) {
                // Format numbers cleanly — no scientific notation
                if (n.doubleValue() == Math.floor(n.doubleValue())) {
                    strValue = String.valueOf(n.longValue());
                } else {
                    strValue = n.toString();
                }
            } else {
                strValue = value.toString().trim();
            }

            if (strValue.isBlank()) continue;
            result.put(key, strValue);
        }

        // ── Canonical field mapping ────────────────────────────────────────────
        // computeNormalizedFields() looks for "relationship_value" as the balance.
        // Map system-specific AUM/value fields to the canonical name.
        switch (systemName) {
            case "EQUITY" -> {
                if (!result.containsKey("relationship_value")) {
                    String val = result.getOrDefault("equity_aum",
                                 result.getOrDefault("relationship_value", null));
                    if (val != null) result.put("relationship_value", val);
                }
            }
            case "MF" -> {
                if (!result.containsKey("relationship_value")) {
                    String val = result.getOrDefault("mf_aum", null);
                    if (val != null) result.put("relationship_value", val);
                }
            }
            case "INSURANCE" -> {
                if (!result.containsKey("relationship_value")) {
                    String val = result.getOrDefault("sum_assured", null);
                    if (val != null) result.put("relationship_value", val);
                }
            }
            case "LOANS" -> {
                if (!result.containsKey("relationship_value")) {
                    String val = result.getOrDefault("loan_amount", null);
                    if (val != null) result.put("relationship_value", val);
                }
            }
            // WEALTH already has "relationship_value" field directly
        }

        return result;
    }
}
