import { SavedIncident } from "../lib/incidentStorage";
import { IoMdClose } from "react-icons/io";

interface IncidentHistorySidebarProps {
  incidents: SavedIncident[];
  isOpen: boolean;
  onClose: () => void;
}

export default function IncidentHistorySidebar({ incidents, isOpen, onClose }: IncidentHistorySidebarProps) {
  if (!isOpen) return null;

  const sortedIncidents = [...incidents].reverse(); // Most recent first

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-[#c9c9c9] dark:bg-[#3a3a3a] border-l border-gray-400 dark:border-gray-600 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#b5b5b5] dark:bg-[#2a2a2a] border-b border-gray-400 dark:border-gray-600 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Incident History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Line 3, Plant 87 (PMO 37)</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <IoMdClose size={24} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="p-4 bg-[#b5b5b5] dark:bg-[#2a2a2a] border-b border-gray-400 dark:border-gray-600">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#d5d5d5] dark:bg-[#1a1a1a] p-2 rounded">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{incidents.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-red-200 dark:bg-red-900/30 p-2 rounded">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {incidents.filter(i => i.severity === 'critical').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
          </div>
          <div className="bg-yellow-200 dark:bg-yellow-900/30 p-2 rounded">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {incidents.filter(i => i.severity === 'moderate').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Moderate</div>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="p-4 space-y-3">
        {sortedIncidents.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-500">
            <p>No incidents recorded yet</p>
            <p className="text-sm mt-2">Run demo to start logging violations</p>
          </div>
        ) : (
          sortedIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`bg-[#d5d5d5] dark:bg-[#2a2a2a] rounded-lg p-3 border-l-4 ${
                incident.severity === 'critical'
                  ? 'border-red-500'
                  : incident.severity === 'moderate'
                  ? 'border-yellow-500'
                  : incident.severity === 'none'
                  ? 'border-green-500'
                  : 'border-blue-500'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Bag #{incident.bagNumber}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(incident.timestamp).toLocaleString()}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    incident.severity === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : incident.severity === 'moderate'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : incident.severity === 'none'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {incident.severity === 'none' ? 'PASS' : incident.severity.toUpperCase()}
                </div>
              </div>

              {/* Violations */}
              <div className="mb-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Violations:</div>
                <div className="flex flex-wrap gap-1">
                  {incident.violationType.map((v, idx) => (
                    <span
                      key={idx}
                      className="bg-[#b5b5b5] dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-300 text-xs px-2 py-0.5 rounded"
                    >
                      {v.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action & Cost */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Action</div>
                  <div
                    className={`text-sm font-semibold ${
                      incident.action === 'stop_line'
                        ? 'text-red-400'
                        : incident.action === 'alert_qa'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    {incident.action.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Cost</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${incident.estimatedCost.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="mb-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reasoning:</div>
                <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {incident.reasoning}
                </div>
              </div>

              {/* Confidence & Risk */}
              <div className="flex items-center justify-between text-xs">
                <div className="text-gray-600 dark:text-gray-400">
                  Confidence: <span className="text-gray-900 dark:text-white">{(incident.confidence * 100).toFixed(0)}%</span>
                </div>
                <div
                  className={`px-2 py-0.5 rounded ${
                    incident.riskLevel === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : incident.riskLevel === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {incident.riskLevel.toUpperCase()} Risk
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
