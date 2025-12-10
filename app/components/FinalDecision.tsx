'use client';

interface Decision {
  status: 'pass' | 'fail' | 'pending';
  reason?: string;
  confidence?: number;
}

interface FinalDecisionProps {
  decision?: Decision;
}

export default function FinalDecision({ decision }: FinalDecisionProps) {
  const getStatusColor = (status: Decision['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-400';
      case 'fail':
        return 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-zinc-100 border-zinc-500 text-zinc-900 dark:bg-zinc-900/20 dark:text-zinc-400';
    }
  };

  return (
    <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        Final Decision
      </h2>
      <div className={`p-4 rounded border-2 ${getStatusColor(decision?.status || 'pending')}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg uppercase">{decision?.status || 'Waiting...'}</span>
          {decision?.confidence && (
            <span className="text-sm">Confidence: {Math.round(decision.confidence * 100)}%</span>
          )}
        </div>
        {decision?.reason && (
          <p className="text-sm mt-2">{decision.reason}</p>
        )}
      </div>
    </div>
  );
}