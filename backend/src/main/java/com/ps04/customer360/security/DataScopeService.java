package com.ps04.customer360.security;

import com.ps04.customer360.auth.UserRepo;
import com.ps04.customer360.auth.model.User;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * DataScopeService — enforces row-level access control.
 *
 * Row-level scope is applied as a MongoDB query Criteria object that is appended
 * to EVERY query that fetches customer or opportunity data. It is NEVER:
 *  - a post-fetch filter (which would be bypassable by sending an unconstrained query)
 *  - trusted from a client-supplied rmId query parameter
 *  - skipped for manager or admin roles (managers have a wider scope, admins have no restriction)
 *
 * Role → scope:
 *  rm      → rmId must equal the principal's rmId
 *  manager → rmId must be in the principal's managerOf list
 *  admin   → no restriction (returns null Criteria, meaning no filter applied)
 */
@Service
public class DataScopeService {

    private final UserRepo userRepo;

    public DataScopeService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    /**
     * Returns a Criteria that constrains queries to only the records visible to this principal.
     * Returns null for admin role (no restriction).
     */
    public Criteria scopeCriteria(AppPrincipal principal) {
        return switch (principal.role()) {
            case "rm" -> Criteria.where("rmId").is(principal.rmId());
            case "manager" -> {
                List<String> managed = userRepo.findByEmail(principal.email())
                        .map(User::getManagerOf)
                        .orElse(List.of());
                // Include the manager's own rmId if set
                if (principal.rmId() != null) {
                    managed = new java.util.ArrayList<>(managed);
                    if (!managed.contains(principal.rmId())) managed.add(principal.rmId());
                }
                yield Criteria.where("rmId").in(managed);
            }
            default -> null; // admin: no scope restriction
        };
    }

    /**
     * Returns the list of rmIds visible to this principal.
     * Used for list-endpoint queries in repositories that accept rmId lists.
     */
    public List<String> visibleRmIds(AppPrincipal principal) {
        return switch (principal.role()) {
            case "rm" -> List.of(principal.rmId());
            case "manager" -> {
                List<String> managed = new java.util.ArrayList<>(
                        userRepo.findByEmail(principal.email())
                                .map(User::getManagerOf)
                                .orElse(List.of())
                );
                if (principal.rmId() != null && !managed.contains(principal.rmId())) {
                    managed.add(principal.rmId());
                }
                yield managed;
            }
            default -> null; // admin: null means "all"
        };
    }

    /** Returns true if the RM/manager is allowed to access a record with the given rmId. */
    public boolean canAccess(AppPrincipal principal, String recordRmId) {
        if ("admin".equals(principal.role())) return true;
        List<String> visible = visibleRmIds(principal);
        return visible != null && visible.contains(recordRmId);
    }
}
