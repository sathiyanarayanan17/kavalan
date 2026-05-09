/**
 * Forensic calculation utilities for time-of-death estimation and anomaly scoring.
 */

/**
 * Simplified Henssge nomogram for PMI estimation.
 * Uses Newton's law of cooling: T(t) = Tambient + (Tnormal - Tambient) * e^(-k*t)
 * Solving for t: t = -ln((Tbody - Tambient) / (Tnormal - Tambient)) / k
 * k is the cooling constant, adjusted for body mass.
 * Normal body temp: 37.2°C
 */
export function henssgeNomogram(
	bodyTemp: number,
	ambientTemp: number,
	weight: number = 70,
): { hours: number; range: [number, number] } {
	const NORMAL_TEMP = 37.2;
	const BASE_K = 0.05; // cooling constant per hour for standard 70kg adult

	// Mass correction: heavier bodies cool slower (k inversely proportional to sqrt of weight/70)
	const massCorrectionFactor = Math.sqrt(70 / Math.max(weight, 20));
	const k = BASE_K * massCorrectionFactor;

	const tempDiff = bodyTemp - ambientTemp;
	const normalDiff = NORMAL_TEMP - ambientTemp;

	// Guard against invalid inputs
	if (tempDiff <= 0 || normalDiff <= 0 || tempDiff >= normalDiff) {
		// Body at or below ambient, or already fully cooled — return a broad late estimate
		return { hours: 24, range: [18, 48] };
	}

	const ratio = tempDiff / normalDiff;
	const hours = -Math.log(ratio) / k;

	// ±25% uncertainty window
	const margin = hours * 0.25;
	return {
		hours: Math.round(hours * 10) / 10,
		range: [
			Math.max(0, Math.round((hours - margin) * 10) / 10),
			Math.round((hours + margin) * 10) / 10,
		],
	};
}

/**
 * Converts rigor mortis stage (0-3) to estimated PMI range in hours.
 * stage 0: <2h (onset begins)
 * stage 1: 2-8h (progressive stiffening)
 * stage 2: 8-18h (full rigor)
 * stage 3: 18-48h (resolving)
 */
export function rigorMortisToHours(stage: number): {
	min: number;
	max: number;
} {
	switch (stage) {
		case 0:
			return { min: 0, max: 2 };
		case 1:
			return { min: 2, max: 8 };
		case 2:
			return { min: 8, max: 18 };
		case 3:
			return { min: 18, max: 48 };
		default:
			return { min: 0, max: 48 };
	}
}

/**
 * Converts livor mortis state to estimated PMI range in hours.
 * none: 0-2h
 * faint: 2-6h
 * well-defined: 6-12h
 * fixed: 12-48h (does not blanch on pressure)
 */
export function livorMortisToHours(state: string): {
	min: number;
	max: number;
} {
	const normalized = state.toLowerCase().trim();
	if (normalized === "none" || normalized === "") return { min: 0, max: 2 };
	if (normalized === "faint") return { min: 2, max: 6 };
	if (normalized === "well-defined" || normalized === "well_defined")
		return { min: 6, max: 12 };
	if (normalized === "fixed") return { min: 12, max: 48 };
	// Unknown state — return broad range
	return { min: 0, max: 48 };
}

/**
 * Computes the intersection of multiple PMI ranges.
 * If ranges do not overlap, returns the best-overlap approximation
 * (midpoint-based fallback).
 */
export function combineTimeRanges(
	ranges: Array<{ min: number; max: number }>,
): { min: number; max: number } {
	if (ranges.length === 0) return { min: 0, max: 48 };

	let combinedMin = ranges[0].min;
	let combinedMax = ranges[0].max;

	for (const range of ranges.slice(1)) {
		combinedMin = Math.max(combinedMin, range.min);
		combinedMax = Math.min(combinedMax, range.max);
	}

	// If no valid intersection, fall back to the union midpoints
	if (combinedMin > combinedMax) {
		const allMins = ranges.map((r) => r.min);
		const allMaxes = ranges.map((r) => r.max);
		const centerEst = (Math.min(...allMaxes) + Math.max(...allMins)) / 2;
		const spread = 2;
		return {
			min: Math.max(0, centerEst - spread),
			max: centerEst + spread,
		};
	}

	return { min: combinedMin, max: combinedMax };
}

/**
 * Given a reference ISO timestamp and a number of hours to subtract,
 * returns the resulting ISO timestamp string.
 */
export function hoursToIso(referenceIso: string, hoursAgo: number): string {
	const ref = new Date(referenceIso);
	const result = new Date(ref.getTime() - hoursAgo * 60 * 60 * 1000);
	return result.toISOString();
}

/**
 * Calculates an anomaly score (0-100) from a sequence of events based on
 * temporal gaps and spatial consistency.
 */
export function calculateAnomaly(
	events: Array<{ timestamp: string; location: string }>,
): number {
	if (events.length < 2) return 0;

	const sorted = [...events].sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);

	let totalAnomalyScore = 0;
	let checks = 0;

	for (let i = 1; i < sorted.length; i++) {
		const prev = sorted[i - 1];
		const curr = sorted[i];

		const prevTime = new Date(prev.timestamp).getTime();
		const currTime = new Date(curr.timestamp).getTime();
		const gapHours = (currTime - prevTime) / (1000 * 60 * 60);

		// Gap anomaly: gaps > 2h score proportionally up to 100
		const gapScore = Math.min(100, (gapHours / 2) * 30);

		// Location anomaly: crude check if locations differ significantly
		const locationScore =
			prev.location &&
			curr.location &&
			prev.location !== curr.location &&
			gapHours < 0.5
				? 80
				: 0;

		totalAnomalyScore += Math.max(gapScore, locationScore);
		checks++;
	}

	return checks > 0 ? Math.min(100, Math.round(totalAnomalyScore / checks)) : 0;
}
