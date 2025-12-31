
export interface KeyFinding {
  itemName: string;
  observedValue: string;
  referenceRange: string;
  status: 'low' | 'normal' | 'high' | 'unknown';
  whatItMeansSimple: string;
  whyItMatters: string;
  confidence: number;
}

export interface Medication {
  name: string;
  use: string;
  frequency: string;
  duration: string;
  alternatives: string[];
}

export interface RecommendedSpecialist {
  specialty: string;
  rationale: string;
  confidence: number;
}

export interface ConcernArea {
  area: string;
  reasoning: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  docType: 'report' | 'prescription' | 'other';
  summary: string;
  findings: KeyFinding[];
  medicines?: Medication[];
  concerns: ConcernArea[];
  urgencyLevel: 'routine' | 'soon' | 'urgent';
  redFlags: string[];
  recommendedSpecialists: RecommendedSpecialist[];
  doctorQuestions: string[];
  immediateSteps: string[];
  timeline: string;
  assumptions: string[];
  reportDate?: string;
  groundingLinks?: GroundingLink[];
}

export interface VaultItem {
  id: string;
  timestamp: number;
  fileName: string;
  analysis: AnalysisResult;
  isSample?: boolean;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}
