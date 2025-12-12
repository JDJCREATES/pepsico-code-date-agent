"use client";

import { useState, useRef } from "react";
import DemoControls from "./components/DemoControls";
import AgentBoard from "./components/AgentBoard";
import CameraFeed from "./components/CameraFeed";
import FinalDecision from "./components/FinalDecision";
import { AgentStep, FinalDecision as FinalDecisionType, StreamMessage } from "./types/agent";
import { IMAGE_CATALOG, getImageSequenceForDemo, ImageMetadata } from "./lib/imageCatalog";
import { imageUrlToBase64 } from "./lib/imageUtils";
import { GiChipsBag } from "react-icons/gi";

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [finalDecision, setFinalDecision] = useState<FinalDecisionType | null>(null);
  const [bagCounter, setBagCounter] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startDemo = async (scenario: string) => {
    setIsRunning(true);
    setBagCounter(0);
    setCurrentImageIndex(0);

    // Create abort controller for stopping
    abortControllerRef.current = new AbortController();

    // Get image sequence (each image repeated 5 times)
    const imageSequence = getImageSequenceForDemo(IMAGE_CATALOG);

    try {
      for (let i = 0; i < imageSequence.length; i++) {
        // Check if stopped
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const imageMetadata = imageSequence[i];
        setCurrentImageIndex(i);
        setCurrentImage(imageMetadata.path);
        setAgentSteps([]);
        setFinalDecision(null);

        // Convert image to base64
        let imageBase64: string;
        try {
          imageBase64 = await imageUrlToBase64(imageMetadata.path);
        } catch (error) {
          console.error('Failed to load image:', imageMetadata.path);
          continue;
        }

        // Analyze the image
        const response = await fetch("/api/demo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            scenario,
            imageBase64,
            metadata: {
              productType: imageMetadata.productType,
              expectedViolations: imageMetadata.violations,
            }
          }),
          signal: abortControllerRef.current.signal,
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

                if (message.type === 'error') {
                  console.error('Stream error:', message.error);
                }
              } catch (error) {
                console.error("Error parsing SSE message:", error);
              }
            }
          }
        }

        // Wait between images to show results
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Demo error:", error);
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const stopDemo = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1800px] mx-auto gap-6 p-4 md:p-8 flex-col md:flex-row">
        {/* Left side - Camera Feed (larger) */}
        <section className="flex-1 md:flex-2 flex flex-col min-h-[60vh] md:min-h-0">
          <div className="mb-4 md:mb-6 hidden md:block">
            <div className="flex items-center gap-3 mb-2">
              <GiChipsBag className="text-4xl md:text-5xl text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                PepsiCo Code Date Quality Control Agent
              </h1>
            </div>
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
              isRunning={isRunning}
              onStart={() => startDemo('default')}
              onStop={stopDemo}
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
              onStop={stopDemo}
              onReset={() => {
                setAgentSteps([]);
                setFinalDecision(null);
                setCurrentImage(null);
                setIsRunning(false);
              }}
            />
          </div>
          <div className="mt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <GiChipsBag className="text-2xl text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                PepsiCo Code Date Quality Control Agent
              </h1>
            </div>
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
