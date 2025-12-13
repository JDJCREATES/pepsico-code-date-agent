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
    description: 'Checking compliance with PepsiCo quality standards',
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
  violationFineRisk: 50000, // $50k potential fine
  plantCodes: {
    '92': 'Frito-Lay Rosenberg, TX',
    '42': 'Frito-Lay Casa Grande, AZ',
    '67': 'Frito-Lay Modesto, CA',
  },
};
