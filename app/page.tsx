"use client";

import { useState, useRef, useEffect } from "react";
import DemoControls from "./components/DemoControls";
import AgentBoard from "./components/AgentBoard";
import CameraFeed from "./components/CameraFeed";
import FinalDecision from "./components/FinalDecision";
import IncidentHistorySidebar from "./components/IncidentHistorySidebar";
import { AgentStep, FinalDecision as FinalDecisionType, StreamMessage } from "./types/agent";
import { generateImageBatch, GeneratedImage } from "./lib/codeDateImageGenerator";
import { getIncidents } from "./lib/incidentStorage";
import { GiChipsBag } from "react-icons/gi";
import { MdHistory } from "react-icons/md";

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [finalDecision, setFinalDecision] = useState<FinalDecisionType | null>(null);
  const [bagCounter, setBagCounter] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [delayBetweenImages, setDelayBetweenImages] = useState(2000);
  const [pauseOnEach, setPauseOnEach] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseResolverRef = useRef<(() => void) | null>(null);

  // Generate images on mount
  useEffect(() => {
    const generate = async () => {
      setIsGenerating(true);
      try {
        const images = await generateImageBatch(50);
        setGeneratedImages(images);
      } catch (error) {
        console.error('Failed to generate images:', error);
      } finally {
        setIsGenerating(false);
      }
    };
    generate();
  }, []);

  const startDemo = async (scenario: string) => {
    if (generatedImages.length === 0) {
      console.error('No images generated yet - still generating...');
      return;
    }

    setIsRunning(true);
    setBagCounter(0);
    setCurrentImageIndex(0);

    // Create abort controller for stopping
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < generatedImages.length; i++) {
        // Check if stopped
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const generatedImage = generatedImages[i];
        setCurrentImageIndex(i);
        setCurrentImage(generatedImage.dataUrl);
        setAgentSteps([]);
        setFinalDecision(null);

        // Extract base64 from data URL (remove data:image/jpeg;base64, prefix)
        const imageBase64 = generatedImage.dataUrl.replace(/^data:image\/\w+;base64,/, '');

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
              productType: 'cheetos',
              expectedViolations: generatedImage.violations,
              codeDate: generatedImage.config,
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

        // Wait between images
        if (pauseOnEach) {
          // Manual advance mode - wait for user to click Next
          setIsPaused(true);
          await new Promise<void>(resolve => {
            pauseResolverRef.current = resolve;
          });
          setIsPaused(false);
        } else if (delayBetweenImages > 0) {
          // Auto mode with delay
          await new Promise(resolve => setTimeout(resolve, delayBetweenImages));
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Demo error:", error);
      }
    } finally {
      setIsRunning(false);
      setIsPaused(false);
      abortControllerRef.current = null;
      pauseResolverRef.current = null;
    }
  };

  const stopDemo = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pauseResolverRef.current) {
      pauseResolverRef.current();
    }
    setIsRunning(false);
    setIsPaused(false);
  };

  const nextImage = () => {
    if (pauseResolverRef.current) {
      pauseResolverRef.current();
      pauseResolverRef.current = null;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1800px] mx-auto gap-6 p-4 md:p-8 flex-col md:flex-row">
        {/* Left side - Camera Feed, Controls, Decision */}
        <section className="flex-1 md:flex-2 flex flex-col gap-4">
          {/* Title */}
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-2">
              <GiChipsBag size={48} color="#2563eb" />
              <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                PepsiCo Code Date Quality Control Agent
              </h1>
            </div>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              An AI agent that analyzes security camera footage to identify code
              date violations in real-time.
            </p>
            <div className="flex items-center gap-4 mt-4">
              {isGenerating && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  🥔 Generating 50 test images...
                </p>
              )}
              {!isGenerating && generatedImages.length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ {generatedImages.length} test images ready
                </p>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <MdHistory size={16} />
                History ({getIncidents().length})
              </button>
            </div>
          </div>
          
          {/* Mobile agent steps above camera */}
          <div className="md:hidden mb-4 max-h-[40vh] overflow-auto">
            <AgentBoard steps={agentSteps} />
          </div>
          
          {/* Camera Feed */}
          <div className="flex-1">
            <CameraFeed currentImage={currentImage} bagCounter={bagCounter} />
          </div>

          {/* Controls and Decision side by side on desktop */}
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            <DemoControls
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={() => startDemo('default')}
              onStop={stopDemo}
              onNext={nextImage}
              onReset={() => {
                setAgentSteps([]);
                setFinalDecision(null);
                setCurrentImage(null);
                setIsRunning(false);
                setIsPaused(false);
              }}
              delayBetweenImages={delayBetweenImages}
              onDelayChange={setDelayBetweenImages}
              pauseOnEach={pauseOnEach}
              onPauseOnEachChange={setPauseOnEach}
            />
            <FinalDecision decision={finalDecision} />
          </div>
        </section>

        {/* Right side - Agent Board (Full Height) */}
        <section className="hidden md:flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden">
            <AgentBoard steps={agentSteps} />
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
              isPaused={isPaused}
              onStart={() => startDemo('default')}
              onStop={stopDemo}
              onNext={nextImage}
              onReset={() => {
                setAgentSteps([]);
                setFinalDecision(null);
                setCurrentImage(null);
                setIsRunning(false);
                setIsPaused(false);
              }}
              delayBetweenImages={delayBetweenImages}
              onDelayChange={setDelayBetweenImages}
              pauseOnEach={pauseOnEach}
              onPauseOnEachChange={setPauseOnEach}
            />
          </div>
          <div className="mt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <GiChipsBag size={32} color="#2563eb" />
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                PepsiCo Code Date Quality Control Agent
              </h1>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              An AI agent that analyzes security camera footage to identify code
              date violations in real-time.
            </p>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mt-4 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <MdHistory size={16} />
              History ({getIncidents().length})
            </button>
          </div>
        </section>
      </main>

      {/* Incident History Sidebar */}
      <IncidentHistorySidebar
        incidents={getIncidents()}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
