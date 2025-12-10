'use client';

import { useState } from 'react';

interface DemoControlsProps {
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

export default function DemoControls({ onStart, onStop, onReset }: DemoControlsProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    setIsRunning(true);
    onStart?.();
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop?.();
  };

  const handleReset = () => {
    setIsRunning(false);
    onReset?.();
  };

  return (
    <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        Controls
      </h2>
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          Start Analysis
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          Stop
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}