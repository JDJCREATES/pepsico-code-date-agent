'use client';

import { FinalDecision as FinalDecisionType } from '@/app/types/agent';

interface FinalDecisionProps {
  decision?: FinalDecisionType | null;
}

export default function FinalDecision({ decision }: FinalDecisionProps) {
  const getStatusColor = (status: FinalDecisionType['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-400';
      case 'fail':
        return 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-zinc-100 border-zinc-500 text-zinc-900 dark:bg-zinc-900/20 dark:text-zinc-400';
    }
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case 'continue':
        return 'bg-green-600 text-white';
      case 'alert_qa':
        return 'bg-yellow-600 text-white';
      case 'stop_line':
        return 'bg-red-600 text-white';
      case 'hold_batch':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-zinc-600 text-white';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="w-full border-t-2 border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-start gap-3">
        {/* Status indicator square */}
        <div className={`flex-shrink-0 w-4 h-4 rounded ${getStatusColor(decision?.status || 'pending')} mt-1`}></div>
        
        {/* Streaming reasoning text */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">
            Final Reasoning
          </h3>
          {decision?.agentReasoning ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed">
                {decision.agentReasoning.reasoning}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Action: <span className="text-blue-600 dark:text-blue-400">{decision.agentReasoning.action.toUpperCase()}</span>
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  Cost: ${decision.agentReasoning.businessImpact.estimatedCost.toLocaleString()}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  Risk: {decision.agentReasoning.businessImpact.riskLevel}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  Confidence: {Math.round(decision.agentReasoning.confidence * 100)}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">Waiting for decision...</p>
          )}
        </div>
      </div>
    </div>
  );
}