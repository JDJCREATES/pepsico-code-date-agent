import { NextRequest } from 'next/server';
import { CodeDateAgent } from '@/app/lib/codeDateAgent';
import { StreamMessage } from '@/app/types/agent';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { scenario, imageBase64, metadata } = await request.json();
    const bagNumber = metadata?.bagNumber || 1;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const agent = new CodeDateAgent({
            onStepUpdate: (step) => {
              const message: StreamMessage = {
                type: 'step',
                step: {
                  ...step,
                  timestamp: new Date(step.timestamp),
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
              );
            },
            onDecision: (decision) => {
              const message: StreamMessage = {
                type: 'decision',
                decision,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
              );
              
              // Stream incident data separately so client can save it
              if (decision.status === 'fail' && decision.agentReasoning) {
                const incidentMessage: StreamMessage = {
                  type: 'incident' as any,
                  incident: {
                    bagNumber,
                    violations: decision.violations,
                    severity: decision.violations.includes('code_date_on_bellmark') ? 'critical' as const :
                              decision.violations.includes('code_date_off_bellmark') ? 'moderate' as const : 
                              'minor' as const,
                    action: decision.agentReasoning.action,
                    estimatedCost: decision.agentReasoning.businessImpact.estimatedCost,
                    riskLevel: decision.agentReasoning.businessImpact.riskLevel,
                    recommendation: decision.agentReasoning.businessImpact.recommendation,
                    reasoning: decision.agentReasoning.reasoning,
                    confidence: decision.agentReasoning.confidence,
                    extractedData: decision.extractedData,
                  } as any,
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(incidentMessage)}\n\n`)
                );
              }
            },
          });

          // Run the agent analysis
          await agent.analyzeImage(imageBase64, bagNumber);

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage: StreamMessage = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
