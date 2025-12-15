// Incident storage system
export interface SavedIncident {
  id: string;
  timestamp: string;
  bagNumber: number;
  violationType: string[];
  severity: 'minor' | 'moderate' | 'critical';
  action: 'continue' | 'alert_qa' | 'stop_line' | 'hold_batch';
  estimatedCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  reasoning: string;
  confidence: number;
  extractedData?: {
    fullText?: string;
    date?: string;
    codeDateLine?: string;
    time?: string;
    plantCode?: string;
    lineNumber?: string;
    positioning?: string;
    printQuality?: string;
  };
}

// In-memory storage (could be localStorage for persistence)
let incidents: SavedIncident[] = [];

export function saveIncident(incident: SavedIncident): void {
  incidents.push(incident);
  console.log('[STORAGE] Saved incident:', incident.id, 'Total incidents:', incidents.length);
}

export function getIncidents(): SavedIncident[] {
  return [...incidents];
}

export function getIncidentsByDateRange(daysBack: number): SavedIncident[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  return incidents.filter(incident => {
    const incidentDate = new Date(incident.timestamp);
    return incidentDate >= cutoffDate;
  });
}

export function clearIncidents(): void {
  incidents = [];
  console.log('[STORAGE] Cleared all incidents');
}

export function getIncidentStats() {
  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  const moderate = incidents.filter(i => i.severity === 'moderate').length;
  const minor = incidents.filter(i => i.severity === 'minor').length;
  
  return {
    total,
    critical,
    moderate,
    minor,
    stopLineCount: incidents.filter(i => i.action === 'stop_line').length,
    alertQACount: incidents.filter(i => i.action === 'alert_qa').length,
  };
}
