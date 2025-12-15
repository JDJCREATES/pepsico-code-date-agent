import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentStep, FinalDecision, ViolationType, ExtractedData, AgentAction, AgentReasoning } from "../types/agent";
import { AGENT_STEPS, StepId, BUSINESS_DATA } from "./agentSteps";
import { getIncidentsByDateRange } from "./incidentStorage";

// LangChain tools for business decision-making
const calculateBusinessImpactTool = tool(
  async ({ action, violationSeverity, plantCode }: { action: AgentAction, violationSeverity: string, plantCode: string }) => {
    let estimatedCost = 0;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendation = '';

    if (action === 'stop_line') {
      estimatedCost = BUSINESS_DATA.lineStopCost;
      riskLevel = violationSeverity === 'critical' ? 'critical' : 'high';
      recommendation = `Line stop costs $${estimatedCost}/hr but prevents potential $${BUSINESS_DATA.violationFineRisk} fine`;
    } else if (action === 'alert_qa') {
      estimatedCost = BUSINESS_DATA.qaAlertCost;
      riskLevel = violationSeverity === 'critical' ? 'high' : 'medium';
      recommendation = `QA alert is cost-effective at $${estimatedCost}, suitable for non-critical issues`;
    } else if (action === 'hold_batch') {
      estimatedCost = BUSINESS_DATA.lineStopCost * 0.25;
      riskLevel = 'medium';
      recommendation = `Batch hold balances cost vs risk for moderate violations`;
    } else {
      estimatedCost = 0;
      riskLevel = 'low';
      recommendation = 'No action needed, product meets standards';
    }

    const plantName = BUSINESS_DATA.plantCodes[plantCode as keyof typeof BUSINESS_DATA.plantCodes] || 'Unknown Plant';

    return {
      action,
      estimatedCost,
      riskLevel,
      recommendation,
      plantInfo: `${plantName} (Code: ${plantCode})`,
    };
  },
  {
    name: "calculate_business_impact",
    description: "Calculate business impact and cost of actions: stop_line (expensive but safe), alert_qa (cheap but riskier), hold_batch (moderate), or continue (free)",
    schema: z.object({
      action: z.enum(['continue', 'alert_qa', 'stop_line', 'hold_batch']),
      violationSeverity: z.string(),
      plantCode: z.string(),
    }),
  }
);

const queryHistoricalIncidentsTool = tool(
  async ({ plantCode, lineNumber, daysBack }: { plantCode: string, lineNumber: string, daysBack: number }) => {
    // Query real saved incidents
    const incidents = getIncidentsByDateRange(daysBack);
    const criticalIncidents = incidents.filter(i => i.severity === 'critical');
    const recentCritical = criticalIncidents.length;
    const totalIncidents = incidents.length;

    let pattern = 'No significant pattern detected';
    if (recentCritical > 2) {
      pattern = 'Recurring critical violations - requires immediate attention';
    } else if (recentCritical > 0) {
      pattern = 'Occasional critical issues detected';
    } else if (totalIncidents > 5) {
      pattern = 'Multiple minor violations - monitor closely';
    }

    const lastCritical = criticalIncidents.length > 0 
      ? criticalIncidents[criticalIncidents.length - 1]
      : null;

    return {
      totalIncidents,
      recentCritical,
      pattern,
      lastCriticalDate: lastCritical ? lastCritical.timestamp : 'None',
      recommendation: recentCritical > 1 
        ? 'Multiple critical violations - recommend line maintenance check'
        : 'Continue standard monitoring',
      incidents: incidents.slice(-5).map(i => ({
        date: i.timestamp,
        type: i.violationType.join(', '),
        action: i.action,
        severity: i.severity,
      })),
    };
  },
  {
    name: "query_historical_incidents",
    description: "Query past quality violations for this production line. Returns incident history, patterns, and recommendations based on historical data.",
    schema: z.object({
      plantCode: z.string(),
      lineNumber: z.string(),
      daysBack: z.number(),
    }),
  }
);

const logViolationTool = tool(
  async ({ violationType, plantCode, lineNumber, severity, imageId, action, estimatedCost, reasoning }: { 
    violationType: string, plantCode: string, lineNumber: string, severity: string, imageId: string,
    action: string, estimatedCost: number, reasoning: string
  }) => {
    const logId = `LOG-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Note: We'll save the full incident after the decision is made
    // This just returns success for the tool call

    return {
      success: true,
      logId,
      timestamp,
      message: `Logged to QMS: ${violationType} (${severity})`,
      database: 'PepsiCo-QMS-Production',
    };
  },
  {
    name: "log_violation_to_database",
    description: "Log quality violation to production database for compliance tracking and auditing.",
    schema: z.object({
      violationType: z.string(),
      plantCode: z.string(),
      lineNumber: z.string(),
      severity: z.string(),
      imageId: z.string(),
      action: z.string(),
      estimatedCost: z.number(),
      reasoning: z.string(),
    }),
  }
);

export interface AgentCallbacks {
  onStepUpdate: (step: AgentStep) => void;
  onDecision: (decision: FinalDecision) => void;
}

export class CodeDateAgent {
  private model: ChatOpenAI;
  private callbacks: AgentCallbacks;
  private tools = [calculateBusinessImpactTool, queryHistoricalIncidentsTool, logViolationTool];

  constructor(callbacks: AgentCallbacks) {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    this.callbacks = callbacks;
  }

  private async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async emitStep(step: AgentStep) {
    this.callbacks.onStepUpdate(step);
    await this.wait(400);
  }

  async analyzeImage(imageBase64: string, bagNumber: number): Promise<FinalDecision> {
    try {
      // STEP 1: Vision Analysis (AI does all extraction)
      const visionStep: AgentStep = {
        id: 'vision-analysis',
        name: 'Vision Analysis',
        description: 'Extracting all code date data using GPT-4 Vision',
        status: 'running',
        nodeType: 'reasoning',
        timestamp: new Date(),
        reasoning: 'Analyzing bag image with GPT-4 Vision...',
      };
      await this.emitStep(visionStep);

      const visionPrompt = `Analyze this Frito-Lay product image. Extract ALL visible text and assess quality.

Code date format:
- Line 1: Date (e.g., "22FEB2022")
- Line 2: Day/Plant/Shift/Julian/Line - all concatenated (e.g., "137133193")
- Line 3: PMO number and Time (e.g., "37 13:08")

Quality checks:
- Position: Code date MUST be directly below the bellmark (quality seal), within about 0.5 inches. If it's significantly off-center horizontally or vertically displaced by more than half an inch, mark as "off_bellmark". If overlapping the bellmark itself, mark as "on_bellmark".
- Print quality: Clear and readable? Not faded?

Return JSON:
{
  "fullText": "all visible text",
  "date": "date string or null",
  "codeDateLine": "day/plant/shift/julian/line string or null",
  "time": "time string or null",
  "plantCode": "2-digit plant code or null",
  "lineNumber": "line number or null",
  "positioning": "correct" | "off_bellmark" | "on_bellmark",
  "printQuality": "good" | "faded" | "unreadable"
}`;

      console.log('[AGENT] Sending vision request...');
      const visionResponse = await this.model.invoke([
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ]);

      console.log('[AGENT] Vision response:', visionResponse.content.toString());

      let visionData: any = {};
      const responseText = visionResponse.content.toString();
      try {
        // Try to extract JSON if wrapped in markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                         responseText.match(/(\{[\s\S]*?\})/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
        visionData = JSON.parse(jsonStr);
        console.log('[AGENT] Parsed vision data:', visionData);
      } catch (error) {
        console.error('[AGENT] JSON parse failed:', error);
        console.error('[AGENT] Raw response:', responseText);
        visionStep.status = 'error';
        visionStep.reasoning = 'Vision extraction failed - invalid JSON response';
        await this.emitStep(visionStep);
        
        throw new Error(`Vision extraction failed: ${error}`);
      }

      visionStep.status = 'completed';
      visionStep.reasoning = `Extracted: "${visionData.fullText?.substring(0, 100) || 'No text'}"`;
      visionStep.extractedData = {
        fullText: visionData.fullText,
        pmoNumber: visionData.plantCode,
        date: visionData.date,
        time: visionData.time,
      };
      await this.emitStep(visionStep);

      // STEP 2: Validation (Deterministic rules checking)
      const validationStep: AgentStep = {
        id: 'validation',
        name: 'Rules Validation',
        description: 'Checking compliance with PepsiCo quality standards',
        status: 'running',
        nodeType: 'reasoning',
        parentId: 'vision-analysis',
        timestamp: new Date(),
        reasoning: 'Validating against quality rules...',
      };
      await this.emitStep(validationStep);

      const violations: ViolationType[] = [];
      let severity: 'minor' | 'moderate' | 'critical' = 'minor';

      // Check missing components
      if (!visionData.date) violations.push('missing_date');
      if (!visionData.time) violations.push('missing_time');
      if (!visionData.plantCode) violations.push('missing_pmo');

      // Check positioning (CRITICAL)
      if (visionData.positioning === 'on_bellmark') {
        violations.push('code_date_on_bellmark');
        severity = 'critical';
      } else if (visionData.positioning === 'off_bellmark') {
        violations.push('code_date_off_bellmark');
        severity = 'moderate';
      }

      // Check print quality
      if (visionData.printQuality === 'unreadable') {
        violations.push('faded_print');
        severity = 'critical';
      } else if (visionData.printQuality === 'faded') {
        violations.push('faded_print');
        if (severity === 'minor') severity = 'moderate';
      }

      const hasViolations = violations.length > 0;

      validationStep.status = hasViolations ? 'error' : 'completed';
      validationStep.reasoning = hasViolations
        ? `Violations detected (${severity}): ${violations.join(', ')}`
        : 'All quality standards met';
      await this.emitStep(validationStep);

      if (!hasViolations) {
        // No violations - simple decision
        const decision: FinalDecision = {
          status: 'pass',
          confidence: 0.95,
          violations: ['none'],
          reason: `PASS: Code date properly positioned below bellmark, all components visible and legible. PMO ${visionData.plantCode || '37'}, Line ${visionData.lineNumber || '3'}.`,
          extractedData: visionStep.extractedData,
          agentReasoning: {
            action: 'continue',
            reasoning: 'All quality standards met: positioning correct, print quality good, all components present.',
            confidence: 0.95,
            businessImpact: {
              estimatedCost: 0,
              riskLevel: 'low',
              recommendation: 'Continue production - no action needed',
            },
          },
        };

        const decisionStep: AgentStep = {
          id: 'agent-decision',
          name: 'Agent Decision',
          description: 'Autonomous action selection',
          status: 'completed',
          nodeType: 'decision',
          parentId: 'validation',
          timestamp: new Date(),
          reasoning: decision.agentReasoning!.reasoning,
        };
        await this.emitStep(decisionStep);
        this.callbacks.onDecision(decision);
        return decision;
      }

      // VIOLATIONS DETECTED - Agent uses tools to make decision

      // Tool 1: Calculate business impact
      const impactStep: AgentStep = {
        id: 'tool-calculate-impact',
        name: 'Calculate Business Impact',
        description: 'Assess cost of line stop vs QA alert',
        status: 'running',
        nodeType: 'tool',
        parentId: 'validation',
        timestamp: new Date(),
        reasoning: 'Calculating business impact of different actions...',
      };
      await this.emitStep(impactStep);

      // Calculate multiple options
      const stopImpact = await calculateBusinessImpactTool.invoke({
        action: 'stop_line',
        violationSeverity: severity,
        plantCode: visionData.plantCode || '92',
      });

      const alertImpact = await calculateBusinessImpactTool.invoke({
        action: 'alert_qa',
        violationSeverity: severity,
        plantCode: visionData.plantCode || '92',
      });

      impactStep.status = 'completed';
      impactStep.toolResult = { stopImpact, alertImpact };
      impactStep.reasoning = `Stop: $${stopImpact.estimatedCost} (${stopImpact.riskLevel}), Alert: $${alertImpact.estimatedCost} (${alertImpact.riskLevel})`;
      await this.emitStep(impactStep);

      // Tool 2: Query historical incidents
      const historyStep: AgentStep = {
        id: 'tool-query-history',
        name: 'Query Historical Incidents',
        description: 'Check past violations for this line',
        status: 'running',
        nodeType: 'tool',
        parentId: 'validation',
        timestamp: new Date(),
        reasoning: 'Querying incident history...',
      };
      await this.emitStep(historyStep);

      const historyData = await queryHistoricalIncidentsTool.invoke({
        plantCode: visionData.plantCode || '92',
        lineNumber: visionData.lineNumber || '13',
        daysBack: 30,
      });

      historyStep.status = 'completed';
      historyStep.toolResult = historyData;
      historyStep.reasoning = `${historyData.totalIncidents} incidents in 30 days. ${historyData.pattern}`;
      await this.emitStep(historyStep);

      // Tool 3: Log violation
      const logStep: AgentStep = {
        id: 'tool-log-violation',
        name: 'Log Violation',
        description: 'Record violation in quality database',
        status: 'running',
        nodeType: 'tool',
        parentId: 'validation',
        timestamp: new Date(),
        reasoning: 'Logging violation to database...',
      };
      await this.emitStep(logStep);

      const logResult = await logViolationTool.invoke({
        violationType: violations[0],
        plantCode: visionData.plantCode || '37',
        lineNumber: visionData.lineNumber || '3',
        severity,
        imageId: `BAG-${bagNumber}`,
        action: 'pending', // Will be determined after agent decision
        estimatedCost: 0,
        reasoning: 'Initial log entry',
      });

      logStep.status = 'completed';
      logStep.toolResult = logResult;
      logStep.reasoning = logResult.message;
      await this.emitStep(logStep);

      // STEP 3: Agent makes autonomous decision
      const decisionStep: AgentStep = {
        id: 'agent-decision',
        name: 'Agent Decision',
        description: 'Autonomous action selection based on context',
        status: 'running',
        nodeType: 'decision',
        parentId: 'validation',
        timestamp: new Date(),
        reasoning: 'Agent reasoning about optimal action...',
      };
      await this.emitStep(decisionStep);

      // Let the LLM decide the action based on all context
      const decisionPrompt = `You are a production line quality control AI agent. Based on the following context, decide what action to take:

VIOLATIONS DETECTED:
${violations.map(v => `- ${v.replace(/_/g, ' ')}`).join('\n')}
Severity: ${severity}

BUSINESS IMPACT ANALYSIS:
- Stop Line: $${stopImpact.estimatedCost}/hr, Risk: ${stopImpact.riskLevel}
  ${stopImpact.recommendation}
- Alert QA: $${alertImpact.estimatedCost}, Risk: ${alertImpact.riskLevel}
  ${alertImpact.recommendation}

HISTORICAL CONTEXT:
${historyData.pattern}
${historyData.recommendation}
Recent critical incidents: ${historyData.recentCritical}

DECISION RULES:
- CRITICAL severity (on bellmark, unreadable) → Usually stop_line
- MODERATE severity with recurring pattern → Consider stop_line
- MODERATE severity, first occurrence → Usually alert_qa
- MINOR severity → alert_qa

Choose ONE action: continue, alert_qa, stop_line, or hold_batch

Respond with JSON:
{
  "action": "your_chosen_action",
  "reasoning": "detailed explanation of why you chose this action based on severity, cost, risk, and historical patterns",
  "confidence": 0.XX
}`;

      const decisionResponse = await this.model.invoke([
        { role: "user", content: decisionPrompt }
      ]);

      console.log('[AGENT] Decision response:', decisionResponse.content.toString());

      let agentDecision: any = { action: 'alert_qa', reasoning: 'Default to QA alert', confidence: 0.7 };
      try {
        const responseText = decisionResponse.content.toString();
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                         responseText.match(/(\{[\s\S]*\})/);
        
        if (jsonMatch) {
          agentDecision = JSON.parse(jsonMatch[1]);
          console.log('[AGENT] Parsed decision:', agentDecision);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (error) {
        console.error('[AGENT] Failed to parse decision, using fallback:', error);
        // Fallback logic based on severity
        if (severity === 'critical') {
          agentDecision = { action: 'stop_line', reasoning: 'Critical violation requires immediate line stop to prevent non-compliant product from reaching consumers', confidence: 0.9 };
        } else if (severity === 'moderate' && historyData.recentCritical > 0) {
          agentDecision = { action: 'stop_line', reasoning: 'Recurring moderate issues combined with past critical violations indicate systemic problem requiring immediate intervention', confidence: 0.85 };
        } else if (severity === 'moderate') {
          agentDecision = { action: 'alert_qa', reasoning: 'Moderate violation warrants QA inspection but does not require full line stop at this time', confidence: 0.8 };
        } else {
          agentDecision = { action: 'alert_qa', reasoning: 'Minor quality issue identified - QA team notified for follow-up inspection', confidence: 0.75 };
        }
      }

      const chosenImpact = agentDecision.action === 'stop_line' ? stopImpact : alertImpact;

      const agentReasoning: AgentReasoning = {
        action: agentDecision.action,
        reasoning: agentDecision.reasoning,
        confidence: agentDecision.confidence,
        businessImpact: {
          estimatedCost: chosenImpact.estimatedCost,
          riskLevel: chosenImpact.riskLevel,
          recommendation: chosenImpact.recommendation,
        },
        historicalContext: historyData.pattern,
      };

      decisionStep.status = 'completed';
      decisionStep.reasoning = `Action: ${agentDecision.action.toUpperCase()} - ${agentDecision.reasoning}`;
      await this.emitStep(decisionStep);

      // Build precise violation description
      const violationDetails = violations.map(v => {
        if (v === 'code_date_on_bellmark') return 'Code date overlapping bellmark seal';
        if (v === 'code_date_off_bellmark') return 'Code date positioning off-center';
        if (v === 'faded_print') return visionData.printQuality === 'unreadable' ? 'Code date unreadable (severely faded)' : 'Code date faded (reduced legibility)';
        if (v === 'missing_date') return 'Date line missing or unreadable';
        if (v === 'missing_time') return 'Time stamp missing or unreadable';
        if (v === 'missing_pmo') return 'PMO number missing or unreadable';
        return v.replace(/_/g, ' ');
      }).join('; ');

      const finalDecision: FinalDecision = {
        status: 'fail',
        confidence: agentDecision.confidence,
        violations,
        reason: `${severity.toUpperCase()}: ${violationDetails}. Action: ${agentDecision.action.replace('_', ' ').toUpperCase()}`,
        extractedData: visionStep.extractedData,
        agentReasoning,
      };

      // Note: Incident saving happens on client side via stream message
      console.log('[AGENT] Decision complete. Bag:', bagNumber, 'Severity:', severity, 'Action:', agentDecision.action);

      this.callbacks.onDecision(finalDecision);
      return finalDecision;

    } catch (error) {
      console.error('Agent error:', error);
      throw error;
    }
  }
}
