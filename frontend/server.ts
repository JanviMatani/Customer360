import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import http from 'http';
import https from 'https';

const BACKEND = 'http://localhost:8000';
const PORT = 3000;

// ─── Tiny HTTP fetch helper (no external deps needed) ───────────────────────
function backendFetch(
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; data: unknown; rawText: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(BACKEND + path);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOpts: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body).toString() } : {}),
      },
    };

    const req = lib.request(reqOpts, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let data: unknown = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
        resolve({ status: res.statusCode || 500, data, rawText: raw });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── Map backend login response → frontend AuthUser shape ────────────────────
function adaptLoginResponse(backendData: Record<string, unknown>, token: string) {
  const email = String(backendData.email ?? '');
  const role = String(backendData.role ?? '').toLowerCase();
  const rmId = backendData.rmId ? String(backendData.rmId) : undefined;

  // Derive a display name from email (rm.anita@bank.com → Anita)
  const localPart = email.split('@')[0];
  const namePart = localPart.replace(/^(rm\.|manager\.)/, '');
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  const teamName =
    role === 'rm'
      ? 'Wealth & Retail Division'
      : role === 'manager'
      ? 'Regional Management'
      : 'Core Enterprise Governance';

  const user = {
    id: email,
    email,
    name: displayName,
    role,
    rmId,
    teamName,
    token,
  };

  return { user, token };
}

// ─── Map backend golden customer to frontend GoldenCustomer shape ─────────────
function adaptCustomer(c: Record<string, unknown>): Record<string, unknown> {
  // Backend may use `id` instead of `goldenId`
  const goldenId = (c.goldenId ?? c.id ?? '') as string;

  // Normalise nested products → productHoldings
  const c360 = (c.customer360 ?? {}) as Record<string, unknown>;
  const products = (c360.products ?? []) as Array<Record<string, unknown>>;
  const productHoldings = products.map((p) => ({
    product: String(p.product ?? '').toLowerCase(),
    system: String(p.product ?? '').toLowerCase(),
    accountId: '',
    balance: Number(p.relationshipValue ?? 0),
    active: p.exists === true && String(p.status ?? '') !== 'LAPSED',
    lastActivityDate: new Date().toISOString(),
  }));

  const rawLinked = c.linkedSources as string[] | undefined;
  const linkedSources = rawLinked?.length 
    ? rawLinked 
    : productHoldings.filter((p) => p.active).map((p) => p.product as string);

  const totalRelationshipValue = Number(c360.totalRelationshipValue ?? c.totalRelationshipValue ?? 0);
  const name = String(c.name ?? 'Unknown');
  const rmId = String(c.rmId ?? '');

  return {
    goldenId,
    name,
    pan: c.primaryPan ?? c.pan ?? null,
    mobile: c.primaryMobile ?? c.mobile ?? null,
    email: c.primaryEmail ?? c.email ?? null,
    dob: c.dob ?? null,
    city: c.city ?? null,
    segment: c.segment ?? null,
    rmId,
    rmName: rmId,
    linkedSources,
    sourceSystems: linkedSources,
    totalRelationshipValue,
    matchConfidence: Number(c.confidenceScore ?? c.matchConfidence ?? 0),
    confidenceScore: Number(c.confidenceScore ?? 0),
    matchDecision: c.matchDecision ?? 'auto_merge',
    attributeConflicts: (c.attributeConflicts ?? []) as unknown[],
    conflicts: (c.attributeConflicts ?? []) as unknown[],
    productHoldings,
    holdings: productHoldings,
    sourceLineage: ((c.sourceLineage ?? []) as Array<Record<string, unknown>>).map(adaptSourceLineage),
    evidence: (c.evidenceTable ?? c.evidence ?? []) as unknown[],
    hasOpportunity: Boolean(c.hasOpportunity),
    opportunityCount: Number(c.opportunityCount ?? 0),
    isDangerousConflict: Boolean(c.isDangerousConflict),
    createdAt: c.createdAt ?? new Date().toISOString(),
  };
}

function adaptSourceLineage(item: Record<string, unknown>): Record<string, unknown> {
  const raw = (item.raw || {}) as Record<string, unknown>;
  const norm = (item.normalized || {}) as Record<string, unknown>;
  
  return {
    system: String(item.sourceSystem || '').toLowerCase(),
    sourceCustomerId: String(item.sourceCustomerId || ''),
    rawName: String(raw.name || raw.customer_name || raw.first_name || 'Unknown'),
    normalizedName: String(norm.name || norm.customerName || norm.firstName || 'Unknown'),
    rawMobile: String(raw.mobile || raw.mobile_number || raw.phone || ''),
    normalizedMobile: String(norm.mobile || norm.mobileNumber || norm.phone || ''),
    rawEmail: String(raw.email || raw.email_address || ''),
    normalizedEmail: String(norm.email || norm.emailAddress || ''),
    rawPan: String(raw.pan || raw.pan_number || ''),
    normalizedPan: String(norm.pan || norm.panNumber || ''),
    rawDob: String(raw.dob || raw.date_of_birth || ''),
    normalizedDob: String(norm.dob || norm.dateOfBirth || ''),
    rawCity: String(raw.city || raw.location || ''),
    normalizedCity: String(norm.city || norm.location || ''),
    segment: String(raw.segment || raw.customer_segment || norm.segment || ''),
    balance: Number(raw.relationship_value || raw.aum || raw.equity_aum || raw.sum_assured || raw.loan_amount || norm.relationshipValue || 0),
    lastActive: String(raw.last_active || norm.lastActive || new Date().toISOString()),
    branch: String(raw.branch || norm.branch || '')
  };
}

// ─── Map backend Opportunity → frontend Opportunity shape ────────────────────
function adaptOpportunity(o: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(o.id ?? o._id ?? ''),
    goldenId: String(o.goldenCustomerId ?? o.goldenId ?? ''),
    goldenCustomerId: String(o.goldenCustomerId ?? o.goldenId ?? ''),
    customerName: String(o.customerName ?? ''),
    product: String(o.product ?? '').toLowerCase(),
    score: Number(o.score ?? 0),
    potentialValue: Number(o.potentialValue ?? 0),
    status: String(o.status ?? 'new').toLowerCase(),
    reasons: (o.reasons ?? []) as unknown[],
    rmId: String(o.rmId ?? ''),
    rmName: String(o.rmName ?? o.rmId ?? ''),
    createdAt: o.createdAt ?? new Date().toISOString(),
    lastUpdated: o.lastUpdated ?? new Date().toISOString(),
    // Advanced fields from new engine
    aiSummary: o.aiSummary ?? null,
    contactWindow: o.contactWindow ?? null,
    suggestedContactBy: o.suggestedContactBy ?? null,
    bundleSummary: o.bundleSummary ?? null,
    category: o.category ?? null,
  };
}

// ─── Map backend ReviewItem → frontend ReviewItem shape ─────────────────────
function adaptReviewItem(r: Record<string, unknown>): Record<string, unknown> {
  const ra = (r.recordA || r.sourceA || {}) as Record<string, unknown>;
  const rb = (r.recordB || r.sourceB || {}) as Record<string, unknown>;
  return {
    id: String(r.id || ''),
    sourceA: {
      system: String(ra.sourceSystem || ra.system || ''),
      sourceCustomerId: String(ra.sourceCustomerId || ''),
      rawName: 'Unknown', normalizedName: 'Unknown',
      rawMobile: '', normalizedMobile: '',
      rawEmail: '', normalizedEmail: '',
      balance: 0, lastActive: new Date().toISOString()
    },
    sourceB: {
      system: String(rb.sourceSystem || rb.system || ''),
      sourceCustomerId: String(rb.sourceCustomerId || ''),
      rawName: 'Unknown', normalizedName: 'Unknown',
      rawMobile: '', normalizedMobile: '',
      rawEmail: '', normalizedEmail: '',
      balance: 0, lastActive: new Date().toISOString()
    },
    confidence: Number(r.confidence || 0),
    decision: (() => {
      const s = String(r.status || r.decision || 'pending').toLowerCase();
      if (s === 'merge') return 'approved';
      if (s === 'separate') return 'rejected';
      return s;
    })(),
    isDangerousConflict: Boolean(r.dangerousConflict || r.isDangerousConflict),
    conflictReason: String(r.dangerReason || r.conflictReason || ''),
    evidence: r.evidence || [],
    reviewedBy: r.decidedBy || r.reviewedBy,
    reviewedAt: r.decidedAt || r.reviewedAt,
    note: r.note,
    candidateGoldenId: r.candidateGoldenId,
    candidateName: r.candidateName || `Pair (${String(ra.sourceSystem || ra.system || 'A')} ↔ ${String(rb.sourceSystem || rb.system || 'B')})`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ═══════════════════════════════════════════════════════════════════════════
  // PROXY MIDDLEWARE — forward /api/* to Spring Boot at port 8000
  // Special handling for login (shape adapter) and customers/opportunities
  // ═══════════════════════════════════════════════════════════════════════════

  app.use('/api', async (req: Request, res: Response) => {
    const backendPath = '/api' + req.path;
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    const fullPath = query ? `${backendPath}?${query}` : backendPath;

    // Extract auth header to forward
    const forwardHeaders: Record<string, string> = {};
    if (req.headers.authorization) {
      forwardHeaders['Authorization'] = req.headers.authorization;
    }

    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      body = JSON.stringify(req.body);
    }

    try {
      const { status, data, rawText } = await backendFetch(req.method, fullPath, forwardHeaders, body);

      // ── Login shape adapter ──────────────────────────────────────────────
      if (req.path === '/auth/login' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const token = String(d.token ?? '');
        return res.status(200).json(adaptLoginResponse(d, token));
      }

      // ── /auth/me adapter ─────────────────────────────────────────────────
      if (req.path === '/auth/me' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const token = (req.headers.authorization ?? '').replace('Bearer ', '');
        const adapted = adaptLoginResponse(d, token);
        return res.status(200).json({ user: adapted.user });
      }

      // ── Customer list adapter ────────────────────────────────────────────
      if (req.path === '/customers' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const raw = (d.customers ?? d.content ?? []) as Array<Record<string, unknown>>;
        const adapted = raw.map(adaptCustomer);
        const total = Number(d.total ?? d.totalElements ?? adapted.length);
        const page = Number(d.page ?? 1);
        const limit = Number(d.limit ?? d.size ?? 10);
        return res.status(200).json({ customers: adapted, total, page, limit, totalPages: Math.ceil(total / limit) });
      }

      // ── Single customer adapter ──────────────────────────────────────────
      if (/^\/customers\/[^/]+$/.test(req.path) && !req.path.includes('/opportunities') && !req.path.includes('/conflicts') && status === 200 && data && typeof data === 'object') {
        return res.status(200).json(adaptCustomer(data as Record<string, unknown>));
      }

      // ── Customer opportunities adapter ───────────────────────────────────
      if (req.path.includes('/opportunities') && req.path.includes('/customers/') && status === 200 && Array.isArray(data)) {
        return res.status(200).json((data as Array<Record<string, unknown>>).map(adaptOpportunity));
      }

      // ── Global opportunities list adapter ────────────────────────────────
      if (req.path === '/opportunities' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const raw = (d.opportunities ?? d.content ?? []) as Array<Record<string, unknown>>;
        const adapted = raw.map(adaptOpportunity);
        const total = Number(d.total ?? d.totalElements ?? adapted.length);
        const page = Number(d.page ?? 1);
        const limit = Number(d.limit ?? 15);
        return res.status(200).json({ opportunities: adapted, total, page, limit });
      }

      // ── Opportunity status update adapter ────────────────────────────────
      if (/^\/opportunities\/[^/]+\/status$/.test(req.path) && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const opp = (d.opportunity ?? data) as Record<string, unknown>;
        return res.status(200).json({ success: true, opportunity: adaptOpportunity(opp) });
      }

      // ── Dashboard stats: normalise field names ────────────────────────────
      if (req.path === '/dashboard/stats' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        // Backend may call field totalCustomers or goldenCustomers
        const stats = {
          ...d,
          totalIngested: d.ingestedRawRows ?? d.totalIngested ?? d.totalRawRecords ?? 0,
          goldenCustomers: d.totalCustomers ?? d.goldenCustomers ?? 0,
          totalCustomers: d.totalCustomers ?? d.goldenCustomers ?? 0,
          autoMerged: d.autoMergedCount ?? d.autoMerged ?? 0,
          autoMergedPercentage: d.totalCustomers ? Math.round((Number(d.autoMergedCount || 0) / Number(d.totalCustomers)) * 100) : 0,
          pendingReview: d.pendingReviewCount ?? d.pendingReview ?? d.pendingReviews ?? 0,
          pendingReviews: d.pendingReviewCount ?? d.pendingReviews ?? d.pendingReview ?? 0,
          separated: d.separated ?? 0,
          conflicts: d.dangerousConflictsCount ?? d.conflicts ?? 0,
          totalPortfolioValue: d.totalRelationshipValue ?? d.totalPortfolioValue ?? 0,
          totalRelationshipValue: d.totalRelationshipValue ?? d.totalPortfolioValue ?? 0,
          activeOpportunities: (Number(d.newOpportunities || 0) + Number(d.inProgressOpportunities || 0)) || Number(d.activeOpportunities || 0),
          totalOpportunityValue: d.totalOpportunityValue ?? ((Number(d.newOpportunities || 0) + Number(d.inProgressOpportunities || 0)) * 250000),
          productsBreakdown: d.productsBreakdown ?? { equity: 3, mf: 4, insurance: 2, loans: 2, wealth: 1 },
          myCustomersCount: d.myCustomersCount ?? d.totalCustomers ?? 0,
          myOpportunitiesCount: d.myOpportunitiesCount ?? ((Number(d.newOpportunities || 0) + Number(d.inProgressOpportunities || 0)) || 0),
          pipelineFunnel: d.pipelineFunnel ?? {
            ingested: d.ingestedRawRows ?? 0, normalized: d.ingestedRawRows ?? 0, candidates: d.totalCustomers ?? 0,
            deterministicMatches: 0, fuzzyMatches: 0,
            autoMerged: d.autoMergedCount ?? 0, manualReview: d.pendingReviewCount ?? 0, separated: 0,
          },
          opportunityDistribution: d.opportunityDistribution ?? [],
        };
        return res.status(200).json(stats);
      }

      // ── Review queue: normalise 'items' ──────────────────────────────────
      if (req.path === '/review' && status === 200 && data) {
        if (Array.isArray(data)) {
          const adaptedArray = (data as Array<Record<string, unknown>>).map(adaptReviewItem);
          return res.status(200).json({ items: adaptedArray, total: adaptedArray.length });
        }
        const d = data as Record<string, unknown>;
        const rawItems = (d.items ?? d.content ?? []) as Array<Record<string, unknown>>;
        return res.status(200).json({
          items: rawItems.map(adaptReviewItem),
          total: d.total ?? rawItems.length,
        });
      }

      // ── Config adapter ────────────────────────────────────────────────────
      if (req.path === '/config' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        // normalise matchConfig
        const mc = (d.matchConfig ?? {}) as Record<string, unknown>;
        const matchConfig = {
          weights: mc.weights ?? { pan: 40, mobile: 25, email: 15, dob: 10, name: 7, city: 3 },
          autoMergeThreshold: mc.autoMergeThreshold ?? 85,
          manualReviewThreshold: mc.manualReviewLowerThreshold ?? mc.manualReviewThreshold ?? 60,
          lastUpdated: mc.lastUpdated ?? new Date().toISOString(),
          updatedBy: mc.updatedBy ?? 'system',
        };
        // opportunityRules: transform from backend format
        const rawRules = (d.opportunityRules ?? d.rules ?? []) as Array<Record<string, unknown>>;
        const opportunityRules = rawRules.map((r) => ({
          id: r.id,
          product: String(r.product ?? '').toLowerCase(),
          title: r.title ?? r.id,
          enabled: r.active ?? r.enabled ?? true,
          conditions: r.conditions ?? {},
          description: r.description ?? '',
        }));
        return res.status(200).json({ matchConfig, opportunityRules });
      }

      // ── Audit logs adapter ────────────────────────────────────────────────
      if (req.path === '/audit' && status === 200 && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const logs = (d.logs ?? d.content ?? []) as Array<Record<string, unknown>>;
        const adapted = logs.map((l) => ({
          id: l.id ?? l._id ?? '',
          timestamp: l.timestamp ?? l.createdAt ?? new Date().toISOString(),
          actorEmail: l.actorEmail ?? l.actorId ?? l.userEmail ?? '',
          actorRole: l.actorRole ?? l.userRole ?? 'admin',
          action: l.action ?? 'CONFIG',
          targetId: l.targetId ?? null,
          description: l.description ?? l.message ?? '',
          metadata: l.metadata ?? null,
        }));
        return res.status(200).json({ logs: adapted, total: d.total ?? adapted.length, page: d.page ?? 1, limit: d.limit ?? 20 });
      }

      // ── Default passthrough ───────────────────────────────────────────────
      res.status(status).send(rawText);
    } catch (err) {
      console.error('[Proxy Error]', req.method, fullPath, err);
      res.status(503).json({ error: 'Backend unavailable. Make sure Spring Boot is running on port 8000.' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VITE DEV SERVER
  // ═══════════════════════════════════════════════════════════════════════════
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Customer 360 Frontend running at http://localhost:${PORT}`);
    console.log(`📡 Proxying /api/* → Spring Boot at ${BACKEND}\n`);
  });
}

startServer();
