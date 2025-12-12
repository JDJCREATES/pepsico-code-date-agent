import { NextRequest } from 'next/server';
import { CodeDateAgent } from '@/app/lib/codeDateAgent';
import { StreamMessage } from '@/app/types/agent';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { scenario, imageBase64, metadata } = await request.json();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const agent = new CodeDateAgent({
            onStepUpdate: (step) => {
              const message: StreamMessage = {
                type: 'step',
                step: {
                  ...step,
                  timestamp: new Date(step.timestamp), // Ensure Date serialization
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
              );
            },
            onFunctionCall: (functionCall) => {
              const message: StreamMessage = {
                type: 'function_call',
                functionCall,
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
            },
          });

          // Run the agent analysis with metadata
          await agent.analyzeImage(imageBase64, metadata);

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
