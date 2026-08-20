package com.ps04.customer360.opportunity;

import com.ps04.customer360.customer360.Customer360Service.Customer360Response;
import com.ps04.customer360.opportunity.model.OpportunityRule;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;

@Service
public class ContactTimingService {

    public record ContactTiming(String window, String suggestedDate, String reason) {}

    public ContactTiming determineTiming(Customer360Response customer, OpportunityRule rule, boolean hasIncompleteData) {
        if (hasIncompleteData) {
            return new ContactTiming("FLEXIBLE", LocalDate.now().plusDays(14).toString(), "Gather missing profile data");
        }

        LocalDate now = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        
        // 1. Product-based urgency (Highest priority)
        if (rule.getProduct().toLowerCase().contains("insurance") && rule.getConditions().stream().anyMatch(c -> c.getField().contains("status"))) {
             return new ContactTiming("URGENT_7D", now.plusDays(7).toString(), "Policy status requires immediate attention");
        }

        // 2. Segment-based timing
        String segment = customer.getSegment() != null ? customer.getSegment().toUpperCase() : "MASS";
        
        return switch (segment) {
            case "HNI", "ULTRA_HNI" -> {
                // HNI prefers quarterly reviews. We'll suggest end of current quarter.
                int month = now.getMonthValue();
                int quarterEndMonth = ((month - 1) / 3 + 1) * 3;
                LocalDate endOfQuarter = LocalDate.of(now.getYear(), quarterEndMonth, 1).with(TemporalAdjusters.lastDayOfMonth());
                yield new ContactTiming("MORNING_WEEKDAY", endOfQuarter.toString(), "Aligns with quarterly portfolio review");
            }
            case "MASS" -> {
                // Mass affluent / salary class -> best to pitch post-salary (1st of next month)
                LocalDate nextSalaryDay = now.plusMonths(1).withDayOfMonth(2);
                yield new ContactTiming("POST_SALARY_EVENING", nextSalaryDay.toString(), "Optimal timing post salary credit");
            }
            default -> { // AFFLUENT
                // Mid-month weekend
                LocalDate midMonth = now.withDayOfMonth(15);
                yield new ContactTiming("MID_MONTH_WEEKEND", midMonth.toString(), "Standard engagement window");
            }
        };
    }
}
