package com.ps04.customer360.opportunity;

import com.ps04.customer360.customer360.Customer360Service.Customer360Response;
import com.ps04.customer360.opportunity.model.Opportunity;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AiSummaryService {

    /**
     * Generates a concise, RM-readable sentence summarizing the opportunity.
     * In a full implementation, this could call an LLM. For now, it uses a template.
     */
    public String generateSummary(Customer360Response customer, Opportunity opp) {
        String trvStr = String.format("₹%.1fL TRV", customer.getTotalRelationshipValue() / 100000.0);
        String segment = customer.getSegment() != null ? customer.getSegment() : "MASS";
        
        String keyReasons = opp.getReasons().stream()
                .filter(Opportunity.ReasonItem::isMet)
                .map(Opportunity.ReasonItem::getLabel)
                .collect(Collectors.joining(" and "));

        if (keyReasons.isEmpty()) {
            keyReasons = "meets rule criteria";
        }

        String contactHint = "";
        if (opp.getContactWindow() != null && opp.getSuggestedContactBy() != null) {
             contactHint = String.format(" — best to contact before %s (%s).", 
                                       opp.getSuggestedContactBy(), 
                                       opp.getContactWindow().toLowerCase().replace("_", " "));
        }

        return String.format("%s (%s, %s) %s — recommend %s%s",
                customer.getName(), trvStr, segment,
                keyReasons,
                opp.getProduct(),
                contactHint
        );
    }
}
