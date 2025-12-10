'use client';

import { useState } from 'react';

interface DemoControlsProps {
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
}

export default function DemoControls({ onStart, onStop, onReset, isRunning = false }: DemoControlsProps) {
  const handleStart = () => {
    onStart?.();
  };

  const handleStop = () => {
    onStop?.();
  };

  const handleReset = () => {
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
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          Start Analysis
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          Stop
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}