import { NodeType } from '@/app/types/agent';

// Proper agentic workflow: Vision → Validation → Tools → Agent Decision
export const AGENT_STEPS = [
  {
    id: 'vision-analysis',
    name: 'Vision Analysis',
    description: 'Extracting all code date data using GPT-4 Vision',
    nodeType: 'reasoning' as NodeType,
    parentId: undefined,
  },
  {
    id: 'validation',
    name: 'Rules Validation',
    description: 'Checking compliance with quality standards',
    nodeType: 'reasoning' as NodeType,
    parentId: 'vision-analysis',
  },
  // Agent tools for business decision-making
  {
    id: 'tool-calculate-impact',
    name: 'Calculate Business Impact',
    description: 'Assess cost of line stop vs QA alert',
    nodeType: 'tool' as NodeType,
    parentId: 'validation',
  },
  {
    id: 'tool-query-history',
    name: 'Query Historical Incidents',
    description: 'Check past violations for this line',
    nodeType: 'tool' as NodeType,
    parentId: 'validation',
  },
  {
    id: 'tool-log-violation',
    name: 'Log Violation',
    description: 'Record violation in quality database',
    nodeType: 'tool' as NodeType,
    parentId: 'validation',
  },
  // Agent makes autonomous decision
  {
    id: 'agent-decision',
    name: 'Agent Decision',
    description: 'Autonomous action selection based on context',
    nodeType: 'decision' as NodeType,
    parentId: 'validation',
  },
] as const;

export type StepId = typeof AGENT_STEPS[number]['id'];

// Simulated business data for demo
export const BUSINESS_DATA = {
  lineStopCost: 15000, // $15k per hour
  qaAlertCost: 500, // $500 per alert
  reworkCostMultiplier: 3.5, // 3.5x original production cost
  batchHoldCost: 200, // $200 per day storage/investigation
  
  // Tiered penalty structure
  penalties: {
    minor: 5000, // $5k - state level fine
    moderate: 25000, // $25k - warning letter + remediation
    critical: 100000, // $100k - consent decree risk
  },
  
  // Recall risk calculation
  recallRisk: {
    minor: 0, // No recall risk
    moderate: 500000, // $500k potential recall
    critical: 5000000, // $5M+ recall + brand damage
  },
  
  plantCodes: {
    '87': 'Production Facility 87',
    '92': 'Production Facility 92',
    '42': 'Production Facility 42',
    '67': 'Production Facility 67',
  },
};
