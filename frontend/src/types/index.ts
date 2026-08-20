export type UserRole = 'rm' | 'manager' | 'admin';

export type SourceSystem = 'equity' | 'mf' | 'insurance' | 'loans' | 'wealth';

export type MatchDecision = 'auto_merge' | 'manual_review' | 'separate' | 'approved' | 'rejected';

export type MatchResult = 'match' | 'conflict' | 'partial' | 'missing';

export type OpportunityProduct = 'insurance' | 'wealth' | 'mf' | 'equity' | 'loans';

export type OpportunityStatus = 'new' | 'in_progress' | 'converted' | 'dismissed';

export interface FieldEvidence {
  field: string;
  weight: number;
  valueA: string | null;
  valueB: string | null;
  result: MatchResult;
  similarity?: number; // 0-100 for fuzzy fields like name
  explanation?: string;
}

export interface AttributeConflict {
  field: string;
  selectedValue: string;
  selectedSource: SourceSystem;
  precedenceBadge?: string;
  conflictingValues: Array<{
    value: string;
    source: SourceSystem;
  }>;
  flaggedForReview?: boolean;
  overrideReason?: string;
}

export interface ProductHolding {
  product: OpportunityProduct;
  system: SourceSystem;
  accountId: string;
  balance: number;
  active: boolean;
  lastActivityDate: string;
  schemeOrPlanName?: string;
  details?: Record<string, any>;
}

export interface SourceRecord {
  system: SourceSystem;
  sourceCustomerId: string;
  rawName: string;
  normalizedName: string;
  rawMobile: string;
  normalizedMobile: string;
  rawEmail: string;
  normalizedEmail: string;
  rawPan?: string;
  normalizedPan?: string;
  rawDob?: string;
  normalizedDob?: string;
  rawCity?: string;
  normalizedCity?: string;
  segment?: string;
  balance: number;
  lastActive: string;
  branch?: string;
}

export interface GoldenCustomer {
  goldenId: string;
  name: string;
  pan?: string; // masked e.g. ABC1****
  rawPan?: string; // stored for backend matching
  mobile?: string; // masked e.g. 98765*****
  rawMobile?: string;
  email?: string;
  dob?: string;
  city?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  segment?: string;
  riskProfile?: string;
  createdAt?: string;
  rmId: string;
  rmName: string;
  linkedSources: SourceSystem[];
  sourceSystems?: SourceSystem[];
  totalRelationshipValue: number;
  matchConfidence: number;
  confidenceScore?: number;
  matchDecision: MatchDecision;
  attributeConflicts: AttributeConflict[];
  conflicts?: AttributeConflict[];
  productHoldings: ProductHolding[];
  holdings?: ProductHolding[];
  sourceLineage: SourceRecord[];
  evidence: FieldEvidence[];
  hasOpportunity: boolean;
  opportunityCount: number;
  isDangerousConflict?: boolean;
  conflictReason?: string;
}

export interface ReviewItem {
  id: string;
  sourceA: SourceRecord;
  sourceB: SourceRecord;
  confidence: number;
  decision: 'pending' | 'approved' | 'rejected';
  isDangerousConflict?: boolean;
  conflictReason?: string;
  evidence: FieldEvidence[];
  reviewedBy?: string;
  reviewedAt?: string;
  note?: string;
  candidateGoldenId?: string;
  candidateName?: string;
}

export interface Opportunity {
  id: string;
  goldenId: string;
  goldenCustomerId?: string;
  customerName: string;
  product: OpportunityProduct;
  score: number;
  potentialValue: number;
  status: OpportunityStatus;
  reasons: Array<{ label: string; value?: string; met: boolean }>;
  rmId: string;
  rmName: string;
  createdAt: string;
  lastUpdated: string;
}

export interface MatchConfig {
  weights: {
    pan: number;
    mobile: number;
    email: number;
    dob: number;
    name: number;
    city: number;
  };
  autoMergeThreshold: number;
  manualReviewThreshold: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface OpportunityRule {
  id: string;
  product: OpportunityProduct;
  title: string;
  enabled: boolean;
  conditions: {
    minEquityBalance?: number;
    minMfBalance?: number;
    minTotalRelationshipValue?: number;
    requiredSegment?: string[];
    targetMissingProduct: OpportunityProduct;
    minScore: number;
    potentialValueFormula?: string;
  };
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'CONFIG' | 'MERGE' | 'OPP' | 'SECURITY' | 'OVERRIDE' | 'LOGIN' | 'UNAUTHORIZED';
  targetId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rmId?: string;
  teamName?: string;
  token: string;
}

export interface DashboardStats {
  totalIngested: number;
  goldenCustomers: number;
  totalCustomers: number;
  autoMerged: number;
  autoMergedPercentage: number;
  pendingReview: number;
  pendingReviews: number;
  separated: number;
  conflicts: number;
  totalPortfolioValue: number;
  totalRelationshipValue: number;
  activeOpportunities: number;
  totalOpportunityValue: number;
  productsBreakdown: {
    equity: number;
    mf: number;
    insurance: number;
    loans: number;
    wealth: number;
  };
  myCustomersCount?: number;
  myOpportunitiesCount?: number;
  pipelineFunnel: {
    ingested: number;
    normalized: number;
    candidates: number;
    deterministicMatches: number;
    fuzzyMatches: number;
    autoMerged: number;
    manualReview: number;
    separated: number;
  };
  opportunityDistribution: Array<{
    product: OpportunityProduct;
    count: number;
    totalPotential: number;
  }>;
}
