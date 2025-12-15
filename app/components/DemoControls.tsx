'use client';

import { useState } from 'react';

interface DemoControlsProps {
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onNext?: () => void;
  isRunning?: boolean;
  disabled?: boolean;
  isPaused?: boolean;
  delayBetweenImages?: number;
  onDelayChange?: (delay: number) => void;
  pauseOnEach?: boolean;
  onPauseOnEachChange?: (pause: boolean) => void;
}

export default function DemoControls({ 
  onStart, 
  onStop, 
  onReset, 
  onNext,
  isRunning = false, 
  disabled = false,
  isPaused = false,
  delayBetweenImages = 2000,
  onDelayChange,
  pauseOnEach = false,
  onPauseOnEachChange,
}: DemoControlsProps) {
  const handleStart = () => {
    onStart?.();
  };

  const handleStop = () => {
    onStop?.();
  };

  const handleReset = () => {
    onReset?.();
  };

  const handleNext = () => {
    onNext?.();
  };

  return (
    <div className="w-full rounded-b-sm border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Controls
        </h2>
        
        {/* Compact Timing Controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              id="pauseOnEach"
              checked={pauseOnEach}
              onChange={(e) => onPauseOnEachChange?.(e.target.checked)}
              className="w-3 h-3 text-cyan-600 bg-zinc-100 border-zinc-300 rounded"
            />
            <label htmlFor="pauseOnEach" className="text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
              Pause
            </label>
          </div>
          <div className="flex items-center gap-1">
            <label className="text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
              {delayBetweenImages / 1000}s
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="500"
              value={delayBetweenImages}
              onChange={(e) => onDelayChange?.(Number(e.target.value))}
              className="w-20 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
            />
          </div>
        </div>
      </div>
      
      {/* Main Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={isRunning || disabled}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          Start Demo
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          Stop
        </button>
        <button
          onClick={handleNext}
          disabled={!isPaused}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          Next →
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