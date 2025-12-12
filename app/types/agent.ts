export type StepStatus = 'pending' | 'running' | 'completed' | 'error';

export type ViolationType = 
  | 'missing_pmo'
  | 'missing_date'
  | 'missing_time'
  | 'expired'
  | 'invalid_format'
  | 'future_date'
  | 'none';

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
  timestamp: Date;
  reasoning?: string;
  extractedData?: ExtractedData;
  functionCalls?: FunctionCall[];
  duration?: number;
}

export interface FinalDecision {
  status: 'pass' | 'fail' | 'pending';
  confidence: number;
  violations: ViolationType[];
  reason: string;
  extractedData?: ExtractedData;
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
