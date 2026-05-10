export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type CaseStatus = "OPEN" | "ACTIVE" | "PENDING" | "CLOSED" | "COLD";
export type EvidenceType =
	| "PHYSICAL"
	| "DIGITAL"
	| "BIOLOGICAL"
	| "TESTIMONIAL"
	| "FORENSIC";
export type DigitalSourceType =
	| "CCTV"
	| "MOBILE"
	| "FINANCIAL"
	| "SOCIAL"
	| "GPS"
	| "EMAIL"
	| "BROWSER";

export interface Case {
	id: string;
	caseRef: string;
	title: string;
	description: string;
	status: CaseStatus;
	riskLevel: RiskLevel;
	riskScore: number;
	location: string;
	dateCreated: string;
	dateOfIncident: string;
	assignedAgent: string;
	suspectCount: number;
	evidenceCount: number;
	victimName: string;
	tags: string; // JSON array string
}

export interface Evidence {
	id: string;
	caseId: string;
	catalogRef: string;
	type: EvidenceType;
	description: string;
	collectedAt: string;
	location: string;
	analyst: string;
	notes: string;
	confidence: number;
	imagePath?: string;
}

export interface AutopsyReport {
	id: string;
	caseId: string;
	rawReport: string;
	analyzedAt: string;
	causeOfDeath: string;
	mannerOfDeath: string;
	postmortemInterval: string;
	injuryPattern: string;
	toxicologyFindings: string;
	woundsCount: number;
	bodyTemperature: number;
	rigorMortisStage: number;
	livorMortisState: string;
	confidence: number;
	analysisNotes: string;
}

export interface TodEstimate {
	id: string;
	caseId: string;
	estimatedAt: string;
	bodyTemp: number;
	ambientTemp: number;
	rigorMortisStage: number;
	livorMortisState: string;
	lastSeenAlive: string;
	estimatedTodEarliest: string;
	estimatedTodLatest: string;
	centralEstimate?: string;
	confidenceLevel: number;
	methodology: string;
	notes: string;
}

export interface DigitalEvidence {
	id: string;
	caseId: string;
	sourceType: DigitalSourceType;
	sourceName: string;
	timestamp: string;
	location: string;
	subject: string;
	description: string;
	confidence: number;
	anomalyScore: number;
	tags: string; // JSON array string
}

export interface CaseActivity {
	id: string;
	caseId: string;
	type:
		| "EVIDENCE_ADDED"
		| "ANALYSIS_RUN"
		| "REPORT_GENERATED"
		| "STATUS_CHANGED"
		| "NOTE_ADDED";
	description: string;
	createdAt: string;
	agent: string;
}

export interface RiskSummary {
	overall: number;
	tier: RiskLevel;
	factors: { label: string; score: number; weight: number }[];
	anomalies: string[];
	recommendations: string[];
}

export interface CorrelationNode {
	id: string;
	label: string;
	type: "SUSPECT" | "VICTIM" | "LOCATION" | "DEVICE" | "VEHICLE";
	timestamp?: string;
	connections: string[];
	weight: number;
}
