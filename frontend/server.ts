import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CUSTOMERS,
  INITIAL_MATCH_CONFIG,
  INITIAL_OPPORTUNITIES,
  INITIAL_OPPORTUNITY_RULES,
  INITIAL_REVIEW_QUEUE,
  INITIAL_USERS,
} from './src/lib/seedData';
import {
  AuditLogEntry,
  AuthUser,
  GoldenCustomer,
  MatchConfig,
  Opportunity,
  OpportunityRule,
  ReviewItem,
  UserRole,
} from './src/types';

// In-Memory Database Store
let users: AuthUser[] = [...INITIAL_USERS];
let customers: GoldenCustomer[] = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
let reviewQueue: ReviewItem[] = JSON.parse(JSON.stringify(INITIAL_REVIEW_QUEUE));
let opportunities: Opportunity[] = JSON.parse(JSON.stringify(INITIAL_OPPORTUNITIES));
let matchConfig: MatchConfig = JSON.parse(JSON.stringify(INITIAL_MATCH_CONFIG));
let opportunityRules: OpportunityRule[] = JSON.parse(JSON.stringify(INITIAL_OPPORTUNITY_RULES));
let auditLogs: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

// Rate limiting & failed attempt state for login lockout
interface LoginAttemptTracker {
  attempts: number;
  lockedUntil: number | null;
}
const loginAttempts: Record<string, LoginAttemptTracker> = {};

function addAuditLog(
  actorEmail: string,
  actorRole: UserRole,
  action: AuditLogEntry['action'],
  description: string,
  targetId?: string,
  metadata?: Record<string, any>
) {
  const newLog: AuditLogEntry = {
    id: `AUD-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole,
    action,
    description,
    targetId,
    metadata,
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 200) auditLogs.pop();
  return newLog;
}

// Recalculate customer match decisions based on updated config thresholds
function recalculateCustomerMatches() {
  customers.forEach((c) => {
    // If customer has a hard dangerous conflict, they never auto-merge
    if (c.isDangerousConflict) {
      c.matchDecision = 'manual_review';
      return;
    }
    if (c.matchConfidence >= matchConfig.autoMergeThreshold) {
      c.matchDecision = 'auto_merge';
    } else if (c.matchConfidence >= matchConfig.manualReviewThreshold) {
      c.matchDecision = 'manual_review';
    } else {
      c.matchDecision = 'separate';
    }
  });
}

// Recalculate opportunity qualification when opportunity rules change
function recalculateOpportunities() {
  const insuranceRule = opportunityRules.find((r) => r.id === 'rule-insurance-cross-sell' && r.enabled);

  customers.forEach((customer) => {
    const eqHolding = customer.productHoldings.find((p) => p.product === 'equity')?.balance || 0;
    const mfHolding = customer.productHoldings.find((p) => p.product === 'mf')?.balance || 0;
    const hasInsurance = customer.productHoldings.some((p) => p.product === 'insurance' && p.active);

    const existingInsuranceOppIndex = opportunities.findIndex(
      (o) => o.goldenId === customer.goldenId && o.product === 'insurance'
    );

    if (insuranceRule) {
      const minEq = insuranceRule.conditions.minEquityBalance ?? 500000;
      const minMf = insuranceRule.conditions.minMfBalance ?? 500000;
      const qualifies = !hasInsurance && eqHolding >= minEq && mfHolding >= minMf;

      if (qualifies) {
        if (existingInsuranceOppIndex === -1) {
          opportunities.push({
            id: `OPP-GEN-${Date.now()}-${customer.goldenId}`,
            goldenId: customer.goldenId,
            customerName: customer.name,
            product: 'insurance',
            score: Math.min(95, Math.round(75 + ((eqHolding + mfHolding) / 1000000) * 2)),
            potentialValue: Math.round((eqHolding + mfHolding) * 0.05),
            status: 'new',
            rmId: customer.rmId,
            rmName: customer.rmName,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            reasons: [
              { label: `Equity portfolio satisfies min threshold (> ₹${(minEq / 100000).toFixed(1)}L)`, value: `₹${(eqHolding / 100000).toFixed(1)}L`, met: true },
              { label: `Mutual Fund holdings satisfy min threshold (> ₹${(minMf / 100000).toFixed(1)}L)`, value: `₹${(mfHolding / 100000).toFixed(1)}L`, met: true },
              { label: 'Zero active Insurance coverage in group records', met: true },
            ],
          });
        } else {
          // Update reasons with current threshold values
          opportunities[existingInsuranceOppIndex].reasons = [
            { label: `Equity portfolio satisfies min threshold (> ₹${(minEq / 100000).toFixed(1)}L)`, value: `₹${(eqHolding / 100000).toFixed(1)}L`, met: true },
            { label: `Mutual Fund holdings satisfy min threshold (> ₹${(minMf / 100000).toFixed(1)}L)`, value: `₹${(mfHolding / 100000).toFixed(1)}L`, met: true },
            { label: 'Zero active Insurance coverage in group records', met: true },
          ];
        }
      } else {
        // If no longer qualifies, remove or mark not met
        if (existingInsuranceOppIndex !== -1) {
          opportunities.splice(existingInsuranceOppIndex, 1);
        }
      }
    }
  });

  // Update customer opportunity counts
  customers.forEach((c) => {
    const opps = opportunities.filter((o) => o.goldenId === c.goldenId);
    c.opportunityCount = opps.length;
    c.hasOpportunity = opps.length > 0;
  });
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  const user = users.find((u) => u.token === token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = user;
  next();
}

function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      addAuditLog(
        req.user.email,
        req.user.role,
        'UNAUTHORIZED',
        `Access Denied: Attempted unauthorized access to ${req.method} ${req.originalUrl}. Required roles: [${allowedRoles.join(', ')}]`,
        undefined,
        { path: req.originalUrl, requiredRoles: allowedRoles }
      );
      return res.status(403).json({
        error: `Forbidden: Access requires [${allowedRoles.join(', ')}] role. This attempt has been logged for security audit.`,
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =================== AUTHENTICATION API ===================
  app.post('/api/auth/login', (req, res) => {
    const { email, role, password } = req.body;
    const identifier = (email || role || 'unknown').toLowerCase();

    // Check lockout
    const tracker = loginAttempts[identifier] || { attempts: 0, lockedUntil: null };
    const now = Date.now();

    if (tracker.lockedUntil && now < tracker.lockedUntil) {
      const remainingSeconds = Math.ceil((tracker.lockedUntil - now) / 1000);
      return res.status(429).json({
        error: `Account temporarily locked due to excessive failed attempts. Try again in ${remainingSeconds}s.`,
        locked: true,
        remainingSeconds,
      });
    }

    // Match by role or email
    let user = users.find((u) => u.role === role || u.email.toLowerCase() === email?.toLowerCase());
    if (!user) {
      tracker.attempts += 1;
      if (tracker.attempts >= 5) {
        tracker.lockedUntil = now + 60000; // 60s lockout
      }
      loginAttempts[identifier] = tracker;
      return res.status(401).json({
        error: 'Invalid credentials or role',
        attempts: tracker.attempts,
        locked: tracker.attempts >= 5,
      });
    }

    // Reset tracker on success
    loginAttempts[identifier] = { attempts: 0, lockedUntil: null };

    addAuditLog(user.email, user.role, 'LOGIN', `User ${user.name} (${user.role.toUpperCase()}) authenticated successfully`);

    res.json({
      user,
      token: user.token,
    });
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res) => {
    if (req.user) {
      addAuditLog(req.user.email, req.user.role, 'LOGIN', `User ${req.user.name} logged out`);
    }
    res.json({ success: true });
  });

  // =================== CUSTOMERS API ===================
  app.get('/api/customers', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { search, sourceSystem, segment, hasOpportunity, page = '1', limit = '10' } = req.query;
    const user = req.user!;

    let filtered = [...customers];

    // RBAC: RM sees only assigned customers!
    if (user.role === 'rm' && user.rmId) {
      filtered = filtered.filter((c) => c.rmId === user.rmId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.goldenId.toLowerCase().includes(q) ||
          (c.pan && c.pan.toLowerCase().includes(q)) ||
          (c.rawPan && c.rawPan.toLowerCase().includes(q)) ||
          (c.mobile && c.mobile.includes(q)) ||
          (c.rawMobile && c.rawMobile.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q))
      );
    }

    if (sourceSystem && typeof sourceSystem === 'string' && sourceSystem !== 'all') {
      filtered = filtered.filter((c) => c.linkedSources.includes(sourceSystem.toLowerCase() as any));
    }

    if (segment && typeof segment === 'string' && segment !== 'all') {
      filtered = filtered.filter((c) => c.segment?.toLowerCase() === segment.toLowerCase());
    }

    if (hasOpportunity === 'true') {
      filtered = filtered.filter((c) => c.hasOpportunity);
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      customers: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
    });
  });

  app.get('/api/customers/:goldenId', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { goldenId } = req.params;
    const user = req.user!;

    const customer = customers.find((c) => c.goldenId.toUpperCase() === goldenId.toUpperCase());
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // RBAC check: RM cannot access other RM's customer
    if (user.role === 'rm' && user.rmId && customer.rmId !== user.rmId) {
      addAuditLog(
        user.email,
        user.role,
        'UNAUTHORIZED',
        `Security Block: RM ${user.name} attempted unauthorized access to customer ${customer.goldenId} assigned to RM ${customer.rmName}`,
        customer.goldenId
      );
      return res.status(403).json({
        error: `Access Denied: Customer ${customer.goldenId} is assigned to RM ${customer.rmName}. Relationship Managers can only view their own assigned accounts.`,
      });
    }

    res.json(customer);
  });

  app.get('/api/customers/:goldenId/opportunities', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { goldenId } = req.params;
    const opps = opportunities.filter((o) => o.goldenId.toUpperCase() === goldenId.toUpperCase());
    res.json(opps);
  });

  // Conflict Override API
  app.post('/api/customers/:goldenId/conflicts/override', authMiddleware, requireRole(['admin', 'manager']), (req: AuthenticatedRequest, res) => {
    const { goldenId } = req.params;
    const { field, selectedValue, selectedSource, reason } = req.body;
    const user = req.user!;

    const customer = customers.find((c) => c.goldenId.toUpperCase() === goldenId.toUpperCase());
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const conflictIndex = customer.attributeConflicts.findIndex((a) => a.field.toLowerCase() === field.toLowerCase());
    if (conflictIndex >= 0) {
      customer.attributeConflicts[conflictIndex].selectedValue = selectedValue;
      customer.attributeConflicts[conflictIndex].selectedSource = selectedSource;
      customer.attributeConflicts[conflictIndex].flaggedForReview = false;
      customer.attributeConflicts[conflictIndex].overrideReason = `${reason} (Overridden by ${user.name} on ${new Date().toLocaleDateString()})`;
    }

    if (field.toLowerCase().includes('email')) {
      customer.email = selectedValue;
    }

    addAuditLog(
      user.email,
      user.role,
      'OVERRIDE',
      `Manual Override applied on ${field} for ${customer.goldenId} (${customer.name}): Set to "${selectedValue}" from ${selectedSource}. Reason: ${reason}`,
      customer.goldenId
    );

    res.json({ success: true, customer });
  });

  // =================== REVIEW QUEUE API ===================
  app.get('/api/review', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { status = 'pending' } = req.query;
    let filtered = reviewQueue;
    if (status && status !== 'all') {
      filtered = reviewQueue.filter((r) => r.decision === status);
    }
    res.json({ items: filtered, total: filtered.length });
  });

  app.post('/api/review/:id/decide', authMiddleware, requireRole(['admin', 'manager', 'rm']), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { decision, note } = req.body;
    const user = req.user!;

    const item = reviewQueue.find((r) => r.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Review item not found' });
    }

    item.decision = decision;
    item.reviewedBy = `${user.name} (${user.role.toUpperCase()})`;
    item.reviewedAt = new Date().toISOString();
    item.note = note || 'Reviewed and confirmed via identity review portal.';

    if (decision === 'approved' && item.candidateGoldenId) {
      const cust = customers.find((c) => c.goldenId === item.candidateGoldenId);
      if (cust) {
        cust.matchDecision = 'approved';
      }
    }

    addAuditLog(
      user.email,
      user.role,
      'MERGE',
      `Review ${item.id} decided as ${decision.toUpperCase()} by ${user.name}. Notes: ${note || 'None'}. Sources: ${item.sourceA.system.toUpperCase()}:${item.sourceA.sourceCustomerId} + ${item.sourceB.system.toUpperCase()}:${item.sourceB.sourceCustomerId}`,
      item.id,
      { decision, note }
    );

    res.json({ success: true, item });
  });

  // =================== OPPORTUNITIES API ===================
  app.get('/api/opportunities', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { rmId, status, product, page = '1', limit = '15' } = req.query;
    const user = req.user!;

    let filtered = [...opportunities];

    // If RM, restrict to own opportunities
    if (user.role === 'rm' && user.rmId) {
      filtered = filtered.filter((o) => o.rmId === user.rmId);
    } else if (rmId && typeof rmId === 'string' && rmId !== 'all') {
      filtered = filtered.filter((o) => o.rmId === rmId);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (product && typeof product === 'string' && product !== 'all') {
      filtered = filtered.filter((o) => o.product === product);
    }

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 15;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      opportunities: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    });
  });

  app.patch('/api/opportunities/:id/status', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;

    const opp = opportunities.find((o) => o.id === id);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const prevStatus = opp.status;
    opp.status = status;
    opp.lastUpdated = new Date().toISOString();

    addAuditLog(
      user.email,
      user.role,
      'OPP',
      `Updated Opportunity ${opp.id} (${opp.product.toUpperCase()} for ${opp.customerName}): ${prevStatus.toUpperCase()} → ${status.toUpperCase()}`,
      opp.id,
      { prevStatus, newStatus: status }
    );

    res.json({ success: true, opportunity: opp });
  });

  // =================== CONFIGURATION API (ADMIN ONLY FOR WRITES) ===================
  app.get('/api/config', authMiddleware, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    // RM cannot access config
    if (user.role === 'rm') {
      addAuditLog(
        user.email,
        user.role,
        'UNAUTHORIZED',
        `Unauthorized Attempt: RM ${user.name} attempted to read /api/config. Access is restricted to Manager and Admin.`
      );
      return res.status(403).json({
        error: 'Access Denied: Configuration engine is restricted to Manager and Admin roles.',
      });
    }

    res.json({
      matchConfig,
      opportunityRules,
    });
  });

  app.put('/api/config', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const { weights, autoMergeThreshold, manualReviewThreshold } = req.body;
    const user = req.user!;

    const prevAuto = matchConfig.autoMergeThreshold;
    const prevManual = matchConfig.manualReviewThreshold;

    if (weights) matchConfig.weights = weights;
    if (autoMergeThreshold !== undefined) matchConfig.autoMergeThreshold = autoMergeThreshold;
    if (manualReviewThreshold !== undefined) matchConfig.manualReviewThreshold = manualReviewThreshold;

    matchConfig.lastUpdated = new Date().toISOString();
    matchConfig.updatedBy = user.email;

    // Recalculate customer match status based on new thresholds
    recalculateCustomerMatches();

    addAuditLog(
      user.email,
      user.role,
      'CONFIG',
      `Match Configuration updated: Auto-Merge ${prevAuto}% → ${matchConfig.autoMergeThreshold}%, Manual Review floor: ${prevManual}% → ${matchConfig.manualReviewThreshold}%`,
      'CONFIG-MATCH',
      { weights: matchConfig.weights, autoMergeThreshold, manualReviewThreshold }
    );

    res.json({ success: true, matchConfig });
  });

  app.put('/api/config/opportunity-rules', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const { rules } = req.body;
    const user = req.user!;

    if (Array.isArray(rules)) {
      opportunityRules = rules;
    }

    // Dynamic rule re-evaluation on all customers!
    recalculateOpportunities();

    addAuditLog(
      user.email,
      user.role,
      'CONFIG',
      `Opportunity Engine Business Rules modified by Admin ${user.name}. Re-evaluated qualification pipeline across all client portfolios.`,
      'CONFIG-OPP-RULES'
    );

    res.json({ success: true, opportunityRules });
  });

  // =================== AUDIT LOGS API ===================
  app.get('/api/audit', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { action, search, page = '1', limit = '20' } = req.query;

    let filtered = [...auditLogs];

    if (action && typeof action === 'string' && action !== 'all') {
      filtered = filtered.filter((l) => l.action === action);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.actorEmail.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      logs: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    });
  });

  app.post('/api/security/log-unauthorized', authMiddleware, (req: AuthenticatedRequest, res) => {
    const { path: routePath, attemptedAction } = req.body;
    const user = req.user!;

    addAuditLog(
      user.email,
      user.role,
      'UNAUTHORIZED',
      `Security Event: User ${user.email} (${user.role.toUpperCase()}) attempted unauthorized navigation/action: ${routePath || attemptedAction}`,
      undefined,
      { routePath, attemptedAction }
    );

    res.json({ success: true });
  });

  // =================== DASHBOARD STATS API ===================
  app.get('/api/dashboard/stats', authMiddleware, (req: AuthenticatedRequest, res) => {
    const user = req.user!;

    const totalIngested = 14;
    const totalGolden = customers.length;
    const autoMerged = customers.filter((c) => c.matchDecision === 'auto_merge').length;
    const pendingReview = reviewQueue.filter((r) => r.decision === 'pending').length;
    const separated = customers.filter((c) => c.matchDecision === 'separate').length;
    const conflicts = customers.reduce((acc, c) => acc + (c.attributeConflicts?.length || 0), 0);
    const totalPortfolioValue = customers.reduce((acc, c) => acc + c.totalRelationshipValue, 0);

    const myCustomers = user.role === 'rm' ? customers.filter((c) => c.rmId === user.rmId) : customers;
    const myOpps = user.role === 'rm' ? opportunities.filter((o) => o.rmId === user.rmId) : opportunities;

    const pipelineFunnel = {
      ingested: 14,
      normalized: 14,
      candidates: 9,
      deterministicMatches: 4,
      fuzzyMatches: 3,
      autoMerged,
      manualReview: pendingReview,
      separated,
    };

    const oppByProduct: Record<string, { count: number; potential: number }> = {
      insurance: { count: 0, potential: 0 },
      wealth: { count: 0, potential: 0 },
      loans: { count: 0, potential: 0 },
      mf: { count: 0, potential: 0 },
      equity: { count: 0, potential: 0 },
    };

    opportunities.forEach((o) => {
      if (oppByProduct[o.product]) {
        oppByProduct[o.product].count += 1;
        oppByProduct[o.product].potential += o.potentialValue || 0;
      }
    });

    const opportunityDistribution = Object.entries(oppByProduct).map(([product, data]) => ({
      product: product as any,
      count: data.count,
      totalPotential: data.potential,
    }));

    res.json({
      totalIngested,
      goldenCustomers: totalGolden,
      autoMerged,
      pendingReview,
      separated,
      conflicts,
      totalPortfolioValue,
      myCustomersCount: myCustomers.length,
      myOpportunitiesCount: myOpps.length,
      pipelineFunnel,
      opportunityDistribution,
    });
  });

  // =================== VITE MIDDLEWARE ===================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial Customer 360 & Opportunity Engine running at http://localhost:${PORT}`);
  });
}

startServer();
