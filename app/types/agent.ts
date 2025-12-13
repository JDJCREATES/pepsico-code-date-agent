export type StepStatus = 'pending' | 'running' | 'completed' | 'error';

export type NodeType = 'reasoning' | 'tool' | 'decision';

export type ViolationType = 
  | 'missing_pmo'
  | 'missing_date'
  | 'missing_time'
  | 'expired'
  | 'invalid_format'
  | 'future_date'
  | 'code_date_off_bellmark' // Code date moved too far from bellmark
  | 'code_date_on_bellmark' // Code date printed on bellmark - automatic hold
  | 'faded_print' // Print quality issues
  | 'wrong_code_type' // 84 vs 90 day mismatch
  | 'wrong_price_marking' // Should have price but doesn't, or vice versa
  | 'none';

export type ProductType = 
  | '84_day_no_price'
  | '84_day_price'
  | '90_day_no_price'
  | '90_day_price';

export type ErrorCategory = 
  | 'good' // Perfect product
  | 'positioning' // Code date placement issues
  | 'quality' // Print quality issues
  | 'incorrect_marking' // Wrong code date type or price marking
  | 'expired'; // Date-related failures

export interface ExtractedData {
  pmoNumber?: string;
  date?: string;
  time?: string;
  fullText?: string;
}

export interface FunctionCall {
  name: string;
  args: any;
  result?: any;
}

export interface AgentStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  nodeType: NodeType; // 'reasoning' for main nodes, 'tool' for function calls
  parentId?: string; // For tree structure
  timestamp: Date;
  reasoning?: string;
  extractedData?: ExtractedData;
  functionCalls?: FunctionCall[];
  toolResult?: any; // Result from individual tool execution
  duration?: number;
}

export type AgentAction = 
  | 'continue' // No issues, continue production
  | 'alert_qa' // Alert quality assurance team
  | 'stop_line' // Emergency stop production line
  | 'hold_batch'; // Hold current batch for review

export interface AgentReasoning {
  action: AgentAction;
  reasoning: string;
  confidence: number;
  businessImpact: {
    estimatedCost: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  };
  historicalContext?: string;
}

export interface FinalDecision {
  status: 'pass' | 'fail' | 'pending';
  confidence: number;
  violations: ViolationType[];
  reason: string;
  extractedData?: ExtractedData;
  agentReasoning?: AgentReasoning;
}

export interface StreamMessage {
  type: 'step' | 'function_call' | 'decision' | 'image' | 'error';
  step?: AgentStep;
  functionCall?: FunctionCall;
  decision?: FinalDecision;
  image?: string;
  error?: string;
  bagNumber?: number;
}
