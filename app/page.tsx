"use client";

import { useState } from "react";
import DemoControls from "./components/DemoControls";
import AgentBoard from "./components/AgentBoard";
import CameraFeed from "./components/CameraFeed";
import FinalDecision from "./components/FinalDecision";
import { AgentStep, FinalDecision as FinalDecisionType, StreamMessage } from "./types/agent";

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [finalDecision, setFinalDecision] = useState<FinalDecisionType | null>(null);
  const [bagCounter, setBagCounter] = useState(0);

  const startDemo = async (scenario: string) => {
    setIsRunning(true);
    setAgentSteps([]);
    setFinalDecision(null);
    setBagCounter(0);

    // TODO: Load actual images from public/images folder
    // For now, using placeholder
    const demoImageBase64 = "placeholder_base64_image_data";
    setCurrentImage('/images/good/sample-1.jpg'); // Update with real path

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          scenario,
          imageBase64: demoImageBase64
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const message: StreamMessage = JSON.parse(line.slice(6));
              
              if (message.type === 'step' && message.step) {
                setAgentSteps((prev) => {
                  const existing = prev.findIndex(s => s.id === message.step!.id);
                  if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = message.step!;
                    return updated;
                  }
                  return [...prev, message.step!];
                });
              }
              
              if (message.type === 'decision' && message.decision) {
                setFinalDecision(message.decision);
                setBagCounter(prev => prev + 1);
              }

              if (message.type === 'image' && message.image) {
                setCurrentImage(message.image);
              }

              if (message.type === 'error') {
                console.error('Stream error:', message.error);
              }
            } catch (error) {
              console.error("Error parsing SSE message:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1800px] mx-auto gap-6 p-4 md:p-8 flex-col md:flex-row">
        {/* Left side - Camera Feed (larger) */}
        <section className="flex-1 md:flex-2 flex flex-col min-h-[60vh] md:min-h-0">
          <div className="mb-4 md:mb-6 hidden md:block">
            <h1 className="mb-2 text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              PepsiCo Code Date Quality Control Agent
            </h1>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              An AI agent that analyzes security camera footage to identify code
              date violations in real-time.
            </p>
          </div>
          
          {/* Mobile agent steps above camera */}
          <div className="md:hidden mb-4 max-h-[40vh] overflow-auto">
            <AgentBoard steps={agentSteps} />
          </div>
          
          <div className="flex-1">
            <CameraFeed currentImage={currentImage} bagCounter={bagCounter} />
          </div>
        </section>

        {/* Right side - Agent Board, Final Decision, Controls (Desktop only) */}
        <section className="hidden md:flex flex-1 flex-col gap-4">
          <div className="flex-1 overflow-auto">
            <AgentBoard steps={agentSteps} />
          </div>
          <div className="w-full">
            <FinalDecision decision={finalDecision} />
          </div>
          <div className="w-full">
            <DemoControls 
              onStart={() => startDemo('default')}
              onStop={() => setIsRunning(false)}
              onReset={() => {
                setAgentSteps([]);
                setFinalDecision(null);
                setCurrentImage(null);
                setIsRunning(false);
              }}
            />
          </div>
        </section>

        {/* Mobile bottom section */}
        <section className="md:hidden flex flex-col gap-4">
          <div className="w-full">
            <FinalDecision decision={finalDecision} />
          </div>
          <div className="w-full">
            <DemoControls
              isRunning={isRunning}
              onStart={() => startDemo('default')}
              onStop={() => setIsRunning(false)}
              onReset={() => {
                setAgentSteps([]);
                setFinalDecision(null);
                setCurrentImage(null);
                setIsRunning(false);
              }}
            />
          </div>
          <div className="mt-4 pb-4">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
              PepsiCo Code Date Quality Control Agent
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              An AI agent that analyzes security camera footage to identify code
              date violations in real-time.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
