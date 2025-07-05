export interface LLMInteraction {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  status: 'approved' | 'blocked' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  violations: Violation[];
  agentActions: AgentAction[];
  userFeedback?: UserFeedback;
  llmSource?: 'groq' | 'fallback';
  llmModel?: string;
  llmError?: string;
}

export interface Violation {
  type: 'pii' | 'hallucination' | 'bias' | 'misinformation' | 'hate_speech' | 'compliance';
  description: string;
  severity: number; // 0-10 scale
  confidence: number;
  reason: string;
  location?: string;
}

export interface AgentAction {
  agentName: string;
  action: 'flag' | 'approve' | 'suggest' | 'log';
  details: string;
  timestamp: Date;
}

export interface UserFeedback {
  rating: 'positive' | 'negative' | 'report';
  comment?: string;
  timestamp: Date;
}

export interface Agent {
  name: string;
  type: 'policy' | 'audit' | 'response' | 'feedback' | 'verifier';
  enabled: boolean;
  process: (interaction: LLMInteraction) => Promise<AgentAction[]>;
}

export interface AgentSettings {
  policyEnforcer: { enabled: boolean };
  verifier: { enabled: boolean };
  auditLogger: { enabled: boolean };
  responseAgent: { enabled: boolean };
  feedbackAgent: { enabled: boolean };
  severityThreshold: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  agentName: string;
  action: string;
  violationType?: string;
  severity?: number;
  interactionId: string;
  details: string;
}

export interface FeedbackEntry {
  id: string;
  timestamp: Date;
  interactionId: string;
  rating: 'positive' | 'negative' | 'flag';
  comment?: string;
}

export interface DashboardStats {
  totalInteractions: number;
  flaggedInteractions: number;
  averageSeverity: number;
  topViolations: Array<{ type: string; count: number }>;
  agentActivity: Array<{ agent: string; actions: number }>;
}