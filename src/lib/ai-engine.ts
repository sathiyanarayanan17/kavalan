/**
 * KAVALAN AI Engine
 * - Autopsy analysis: Claude Haiku 4.5 via AWS Bedrock (real NLP)
 * - Digital correlation: Claude Haiku 4.5 via AWS Bedrock (real intelligence)
 * - TOD estimation: Henssge nomogram (real forensic math, no AI needed)
 * - Risk scoring: weighted formula (deterministic, auditable)
 */
import type { RiskLevel } from "@/types";
import {
	henssgeNomogram,
	rigorMortisToHours,
	livorMortisToHours,
	combineTimeRanges,
	hoursToIso,
	calculateAnomaly,
} from "@/lib/forensics";

// ─── Bedrock client ───────────────────────────────────────────────────────────

const BEDROCK_MODEL =
	process.env.BEDROCK_MODEL ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const BEDROCK_REGION = process.env.BEDROCK_REGION ?? "us-east-1";

async function callClaude(
	systemPrompt: string,
	userMessage: string,
	maxTokens = 1024,
): Promise<string> {
	const apiKey = process.env.BEDROCK_API_KEY;
	if (!apiKey) throw new Error("BEDROCK_API_KEY not set");

	const url = `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com/model/${BEDROCK_MODEL}/invoke`;

	const body = {
		anthropic_version: "bedrock-2023-05-31",
		max_tokens: maxTokens,
		system: systemPrompt,
		messages: [{ role: "user", content: userMessage }],
	};

	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Bedrock error ${res.status}: ${err}`);
	}

	const data = (await res.json()) as {
		content: Array<{ type: string; text: string }>;
	};
	return data.content.find((b) => b.type === "text")?.text ?? "";
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AutopsyAnalysisInput {
	reportText: string;
	bodyTemperature?: number;
	ambientTemperature?: number;
	rigorMortisStage?: number;
	livorMortisState?: string;
}

export interface AutopsyAnalysisResult {
	causeOfDeath: string;
	mannerOfDeath: string;
	postmortemInterval: string;
	injuryPattern: string;
	toxicologyFindings: string;
	woundsCount: number;
	confidence: number;
	analysisNotes: string;
	extractedKeywords: string[];
	timeOfDeathEstimate?: string;
}

export interface TodInput {
	bodyTemp: number;
	ambientTemp: number;
	rigorMortisStage: number;
	livorMortisState: string;
	lastSeenAlive?: string;
	weight?: number;
}

export interface TodResult {
	estimatedTodEarliest: string;
	estimatedTodLatest: string;
	centralEstimate: string;
	confidenceLevel: number;
	methodology: string;
	notes: string;
	pmhHours: { min: number; max: number; central: number };
}

export interface DigitalCorrelationInput {
	events: Array<{
		sourceType: string;
		timestamp: string;
		location: string;
		subject: string;
		description: string;
	}>;
}

export interface DigitalCorrelationResult {
	anomalies: Array<{
		type: string;
		severity: string;
		description: string;
		timestamps: string[];
	}>;
	timeline: Array<{
		timestamp: string;
		event: string;
		source: string;
		significance: string;
	}>;
	patterns: Array<{ pattern: string; confidence: number; subjects: string[] }>;
	riskContribution: number;
}

export interface RiskScoreInput {
	caseId: string;
	evidenceCount: number;
	suspectCount: number;
	digitalAnomalyCount: number;
	hasAutopsy: boolean;
	hasTodEstimate: boolean;
	mannerOfDeath?: string;
	openTimelinGaps: number;
	caseAgeHours: number;
}

export interface RiskScoreResult {
	overall: number;
	tier: RiskLevel;
	factors: Array<{
		label: string;
		score: number;
		weight: number;
		description: string;
	}>;
	anomalies: string[];
	recommendations: string[];
}

// ─── analyzeAutopsyReport — real Claude NLP ───────────────────────────────────

export async function analyzeAutopsyReport(
	input: AutopsyAnalysisInput,
): Promise<AutopsyAnalysisResult> {
	const {
		reportText,
		bodyTemperature,
		ambientTemperature,
		rigorMortisStage = 1,
		livorMortisState = "faint",
	} = input;

	// Calculate PMI from physical measurements (real math, not AI)
	let postmortemInterval = "";
	let timeOfDeathEstimate: string | undefined;

	if (bodyTemperature !== undefined && ambientTemperature !== undefined) {
		const tempResult = henssgeNomogram(bodyTemperature, ambientTemperature);
		const rigorRange = rigorMortisToHours(rigorMortisStage);
		const livorRange = livorMortisToHours(livorMortisState);
		const combined = combineTimeRanges([
			{ min: tempResult.range[0], max: tempResult.range[1] },
			rigorRange,
			livorRange,
		]);
		postmortemInterval = `${Math.round(combined.min)}–${Math.round(combined.max)} hours`;
		timeOfDeathEstimate = `Estimated ${Math.round(combined.min)}–${Math.round(combined.max)} hours prior to discovery`;
	} else {
		const rigorRange = rigorMortisToHours(rigorMortisStage);
		const livorRange = livorMortisToHours(livorMortisState);
		const combined = combineTimeRanges([rigorRange, livorRange]);
		postmortemInterval = `${Math.round(combined.min)}–${Math.round(combined.max)} hours (temperature data unavailable)`;
	}

	const systemPrompt = `You are a forensic pathology AI assistant for the KAVALAN investigative system. 
Analyze autopsy reports and extract structured forensic intelligence. 
Be precise, clinical, and evidence-based. Never speculate beyond what the report states.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

	const userMessage = `Analyze this autopsy report and return a JSON object with exactly these fields:
- causeOfDeath: string (precise medical cause, e.g. "Blunt force traumatic brain injury")
- mannerOfDeath: one of "HOMICIDE" | "SUICIDE" | "NATURAL" | "ACCIDENTAL" | "UNDETERMINED"
- injuryPattern: string (clinical description of wound distribution and what it indicates)
- toxicologyFindings: string (substances found and their significance, or "No significant findings")
- woundsCount: number (estimated total distinct injuries)
- confidence: number 0-100 (how confident based on report completeness and clarity)
- analysisNotes: string (key forensic observations, methodology notes, caveats)
- extractedKeywords: string[] (list of forensic terms found: injury types, substances, conditions)

AUTOPSY REPORT:
${reportText}

${bodyTemperature !== undefined ? `Body temperature at scene: ${bodyTemperature}°C, Ambient: ${ambientTemperature}°C` : ""}
${rigorMortisStage !== undefined ? `Rigor mortis stage: ${rigorMortisStage} (0=none, 1=early, 2=full, 3=resolving)` : ""}
${livorMortisState ? `Livor mortis state: ${livorMortisState}` : ""}

Respond with JSON only.`;

	try {
		const raw = await callClaude(systemPrompt, userMessage, 1024);
		// Strip markdown code fences if present
		const cleaned = raw
			.replace(/^```(?:json)?\n?/i, "")
			.replace(/\n?```$/i, "")
			.trim();
		const parsed = JSON.parse(cleaned);

		return {
			causeOfDeath: parsed.causeOfDeath ?? "Undetermined",
			mannerOfDeath: parsed.mannerOfDeath ?? "UNDETERMINED",
			postmortemInterval,
			injuryPattern: parsed.injuryPattern ?? "",
			toxicologyFindings:
				parsed.toxicologyFindings ?? "No significant findings",
			woundsCount: parsed.woundsCount ?? 0,
			confidence: parsed.confidence ?? 50,
			analysisNotes: parsed.analysisNotes ?? "",
			extractedKeywords: parsed.extractedKeywords ?? [],
			timeOfDeathEstimate,
		};
	} catch (err) {
		// Fallback to heuristic if Claude fails
		console.error("Claude autopsy analysis failed, using fallback:", err);
		return analyzeAutopsyReportFallback(
			input,
			postmortemInterval,
			timeOfDeathEstimate,
		);
	}
}

// ─── analyzeAutopsyReport fallback (keyword heuristic) ───────────────────────

function analyzeAutopsyReportFallback(
	input: AutopsyAnalysisInput,
	postmortemInterval: string,
	timeOfDeathEstimate?: string,
): AutopsyAnalysisResult {
	const { reportText } = input;
	const lower = reportText.toLowerCase();

	const keywords: string[] = [];
	const injuryTerms = [
		"blunt force",
		"laceration",
		"strangulation",
		"gunshot",
		"stabbing",
		"fracture",
		"contusion",
		"hematoma",
		"defensive wound",
		"subdural",
		"hemorrhage",
		"trauma",
	];
	for (const t of injuryTerms) if (lower.includes(t)) keywords.push(t);

	const manner =
		lower.includes("defensive") ||
		lower.includes("ligature") ||
		lower.includes("gunshot") ||
		lower.includes("execution")
			? "HOMICIDE"
			: lower.includes("cardiac") || lower.includes("myocardial")
				? "NATURAL"
				: "UNDETERMINED";

	const cause = lower.includes("gunshot")
		? "Gunshot wound — projectile trauma"
		: lower.includes("strangulation") || lower.includes("ligature")
			? "Asphyxia due to ligature strangulation"
			: lower.includes("blunt")
				? "Blunt force traumatic brain injury"
				: "Cause pending further analysis";

	return {
		causeOfDeath: cause,
		mannerOfDeath: manner,
		postmortemInterval,
		injuryPattern: keywords.join("; ") || "Pattern analysis pending",
		toxicologyFindings:
			lower.includes("ethanol") || lower.includes("benzodiazepine")
				? "Substances detected — full panel pending"
				: "No significant findings",
		woundsCount: Math.max(1, keywords.length),
		confidence: 45,
		analysisNotes:
			"Fallback heuristic analysis — Claude inference unavailable.",
		extractedKeywords: keywords,
		timeOfDeathEstimate,
	};
}

// ─── correlateDigitalEvidence — real Claude intelligence ─────────────────────

export async function correlateDigitalEvidence(
	input: DigitalCorrelationInput,
): Promise<DigitalCorrelationResult> {
	const { events } = input;

	if (!events || events.length === 0) {
		return { anomalies: [], timeline: [], patterns: [], riskContribution: 0 };
	}

	const sorted = [...events].sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);

	const systemPrompt = `You are a forensic digital intelligence analyst for the KAVALAN system.
Analyze digital evidence timelines and identify investigative anomalies, suspicious patterns, and correlations.
Be precise and evidence-based. Think like a detective. Respond with valid JSON only.`;

	const eventsText = sorted
		.map(
			(e, i) =>
				`[${i + 1}] ${e.timestamp} | ${e.sourceType} | Subject: ${e.subject} | Location: ${e.location}\n    ${e.description}`,
		)
		.join("\n");

	const userMessage = `Analyze this digital evidence timeline for a criminal investigation and return a JSON object with:

- anomalies: array of objects with:
  - type: string (e.g. "TEMPORAL_GAP", "LOCATION_CONTRADICTION", "DEVICE_SILENCE", "SUSPICIOUS_ACTIVITY", "FINANCIAL_ANOMALY", "COORDINATED_ACTION")
  - severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"  
  - description: string (detailed investigative explanation of why this is suspicious)
  - timestamps: string[] (relevant ISO timestamps from the evidence)

- patterns: array of objects with:
  - pattern: string (behavioral or evidential pattern identified)
  - confidence: number 0-100
  - subjects: string[] (subjects involved)

- riskContribution: number 0-100 (how much this digital evidence raises overall case risk)

- summary: string (2-3 sentence investigative narrative of what the digital evidence suggests happened)

DIGITAL EVIDENCE TIMELINE:
${eventsText}

Focus on: timeline gaps, impossible movements, device going offline at critical times, financial activity near incident, coordinated behavior across subjects, pre-meditation indicators.
Respond with JSON only.`;

	try {
		const raw = await callClaude(systemPrompt, userMessage, 1500);
		const cleaned = raw
			.replace(/^```(?:json)?\n?/i, "")
			.replace(/\n?```$/i, "")
			.trim();
		const parsed = JSON.parse(cleaned);

		const timeline = sorted.map((ev) => ({
			timestamp: ev.timestamp,
			event: ev.description,
			source: `${ev.sourceType} — ${ev.subject}`,
			significance: (parsed.anomalies ?? []).some(
				(a: { timestamps: string[] }) =>
					a.timestamps.some(
						(t: string) =>
							t === ev.timestamp || ev.timestamp.startsWith(t.substring(0, 16)),
					),
			)
				? "FLAGGED"
				: "NORMAL",
		}));

		return {
			anomalies: parsed.anomalies ?? [],
			timeline,
			patterns: parsed.patterns ?? [],
			riskContribution: parsed.riskContribution ?? 0,
		};
	} catch (err) {
		console.error("Claude correlation failed, using fallback:", err);
		return correlateDigitalEvidenceFallback(input);
	}
}

// ─── correlateDigitalEvidence fallback ───────────────────────────────────────

function correlateDigitalEvidenceFallback(
	input: DigitalCorrelationInput,
): DigitalCorrelationResult {
	const { events } = input;
	const sorted = [...events].sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);
	const anomalies: DigitalCorrelationResult["anomalies"] = [];

	for (let i = 1; i < sorted.length; i++) {
		const gap =
			(new Date(sorted[i].timestamp).getTime() -
				new Date(sorted[i - 1].timestamp).getTime()) /
			3600000;
		if (gap > 2 && sorted[i].subject === sorted[i - 1].subject) {
			anomalies.push({
				type: "TEMPORAL_GAP",
				severity: gap > 8 ? "HIGH" : "MEDIUM",
				description: `${gap.toFixed(1)}h gap in activity for subject "${sorted[i].subject}"`,
				timestamps: [sorted[i - 1].timestamp, sorted[i].timestamp],
			});
		}
	}

	return {
		anomalies,
		timeline: sorted.map((ev) => ({
			timestamp: ev.timestamp,
			event: ev.description,
			source: `${ev.sourceType} — ${ev.subject}`,
			significance: "NORMAL",
		})),
		patterns: [],
		riskContribution: anomalies.length * 10,
	};
}

// ─── estimateTod — Henssge nomogram (real forensic math) ─────────────────────

export function estimateTod(input: TodInput): TodResult {
	const {
		bodyTemp,
		ambientTemp,
		rigorMortisStage,
		livorMortisState,
		lastSeenAlive,
		weight = 70,
	} = input;
	const now = new Date().toISOString();

	const tempEstimate = henssgeNomogram(bodyTemp, ambientTemp, weight);
	const rigorRange = rigorMortisToHours(rigorMortisStage);
	const livorRange = livorMortisToHours(livorMortisState);
	const combined = combineTimeRanges([
		{ min: tempEstimate.range[0], max: tempEstimate.range[1] },
		rigorRange,
		livorRange,
	]);

	const finalMin = combined.min;
	let finalMax = combined.max;
	let lastSeenNote = "";

	if (lastSeenAlive) {
		const hoursSinceLastSeen =
			(new Date().getTime() - new Date(lastSeenAlive).getTime()) / 3600000;
		if (finalMax > hoursSinceLastSeen) {
			finalMax = Math.min(finalMax, hoursSinceLastSeen);
			lastSeenNote = ` Upper bound constrained by last-seen-alive (${lastSeenAlive}).`;
		}
	}

	const centralHours = (finalMin + finalMax) / 2;
	let confidenceLevel = 70;
	const rangeWidth = finalMax - finalMin;
	if (rangeWidth < 4) confidenceLevel += 15;
	else if (rangeWidth < 8) confidenceLevel += 8;
	else if (rangeWidth > 20) confidenceLevel -= 15;
	if (bodyTemp > ambientTemp + 2) confidenceLevel += 5;
	if (lastSeenAlive) confidenceLevel += 5;
	confidenceLevel = Math.min(95, Math.max(30, confidenceLevel));

	const methodology =
		`Henssge nomogram: body ${bodyTemp}°C, ambient ${ambientTemp}°C (${weight}kg). ` +
		`k=${(0.05 * Math.sqrt(70 / weight)).toFixed(3)}/hr. Temp PMI: ${tempEstimate.hours}h ` +
		`(${tempEstimate.range[0]}–${tempEstimate.range[1]}h). ` +
		`Rigor stage ${rigorMortisStage} → ${rigorRange.min}–${rigorRange.max}h. ` +
		`Livor (${livorMortisState}) → ${livorRange.min}–${livorRange.max}h. ` +
		`Intersected: ${Math.round(finalMin)}–${Math.round(finalMax)}h PMI.${lastSeenNote}`;

	return {
		estimatedTodEarliest: hoursToIso(now, finalMax),
		estimatedTodLatest: hoursToIso(now, finalMin),
		centralEstimate: hoursToIso(now, centralHours),
		confidenceLevel,
		methodology,
		notes:
			`PMI: ${Math.round(finalMin)}–${Math.round(finalMax)}h. Central: ${Math.round(centralHours)}h ago. ` +
			(lastSeenAlive ? `Last seen: ${lastSeenAlive}. ` : "") +
			`Confidence: ${confidenceLevel}%. Environmental factors may shift ±20%.`,
		pmhHours: {
			min: Math.round(finalMin * 10) / 10,
			max: Math.round(finalMax * 10) / 10,
			central: Math.round(centralHours * 10) / 10,
		},
	};
}

// ─── calculateRiskScore — deterministic formula ───────────────────────────────

export function calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
	const {
		evidenceCount,
		suspectCount,
		digitalAnomalyCount,
		hasAutopsy,
		hasTodEstimate,
		mannerOfDeath,
		openTimelinGaps,
		caseAgeHours,
	} = input;

	const factors: RiskScoreResult["factors"] = [];

	const evidenceScore = Math.min(20, Math.round(Math.log1p(evidenceCount) * 6));
	factors.push({
		label: "Evidence Volume",
		score: evidenceScore,
		weight: 20,
		description: `${evidenceCount} item(s) catalogued.`,
	});

	const suspectScore = Math.min(20, Math.round(suspectCount * 4));
	factors.push({
		label: "Suspect Density",
		score: suspectScore,
		weight: 20,
		description: `${suspectCount} suspect(s) identified.`,
	});

	const digitalScore = Math.min(20, Math.round(digitalAnomalyCount * 5));
	factors.push({
		label: "Digital Anomalies",
		score: digitalScore,
		weight: 20,
		description: `${digitalAnomalyCount} anomaly/anomalies flagged.`,
	});

	const forensicInverse =
		20 - ((hasAutopsy ? 10 : 0) + (hasTodEstimate ? 10 : 0));
	factors.push({
		label: "Forensic Incompleteness",
		score: forensicInverse,
		weight: 20,
		description: `Autopsy: ${hasAutopsy ? "complete" : "pending"}. TOD: ${hasTodEstimate ? "complete" : "pending"}.`,
	});

	const urgencyScore = Math.min(
		20,
		Math.round(Math.max(0, 20 - (caseAgeHours / 720) * 20)),
	);
	factors.push({
		label: "Case Urgency",
		score: urgencyScore,
		weight: 20,
		description: `Case is ${Math.round(caseAgeHours)}h old.`,
	});

	const overall = factors.reduce((s, f) => s + f.score, 0);
	const tier: RiskLevel =
		overall >= 70
			? "CRITICAL"
			: overall >= 50
				? "HIGH"
				: overall >= 30
					? "MEDIUM"
					: "LOW";

	const anomalies: string[] = [];
	if (!hasAutopsy) anomalies.push("No autopsy on file");
	if (!hasTodEstimate) anomalies.push("TOD not estimated");
	if (openTimelinGaps > 2) anomalies.push(`${openTimelinGaps} timeline gaps`);
	if (digitalAnomalyCount >= 3)
		anomalies.push(
			"Multiple digital anomalies — possible coordinated concealment",
		);
	if (mannerOfDeath === "HOMICIDE")
		anomalies.push("Homicide confirmed — escalated priority");
	if (suspectCount === 0) anomalies.push("No suspects identified");
	if (caseAgeHours < 24)
		anomalies.push("Scene within 24h — time-critical evidence window");

	const recommendations: string[] = [];
	if (!hasAutopsy) recommendations.push("Commission autopsy immediately");
	if (!hasTodEstimate)
		recommendations.push("Submit temperature data for TOD analysis");
	if (digitalAnomalyCount >= 2)
		recommendations.push("Escalate digital forensics review");
	if (mannerOfDeath === "HOMICIDE" && suspectCount === 0)
		recommendations.push("Expedite CCTV and witness review");
	if (tier === "CRITICAL")
		recommendations.push("Request dedicated task force resources");

	return { overall, tier, factors, anomalies, recommendations };
}
