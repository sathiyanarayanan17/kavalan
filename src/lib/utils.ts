import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { RiskLevel, CaseStatus } from "@/types";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string to "DD MMM YYYY" or "DD MMM YYYY HH:mm".
 */
export function formatDate(iso: string, includeTime = false): string {
	const date = parseISO(iso);
	return includeTime
		? format(date, "dd MMM yyyy HH:mm")
		: format(date, "dd MMM yyyy");
}

/**
 * Formats an ISO date string to 24-hour "HH:mm:ss".
 */
export function formatTime(iso: string): string {
	return format(parseISO(iso), "HH:mm:ss");
}

/**
 * Returns a Tailwind text-color class for the given risk level.
 */
export function getRiskColor(risk: RiskLevel): string {
	switch (risk) {
		case "CRITICAL":
			return "text-crimson";
		case "HIGH":
			return "text-amber";
		case "MEDIUM":
			return "text-amber-dim";
		case "LOW":
			return "text-sage";
		default:
			return "text-muted";
	}
}

/**
 * Returns a Tailwind background-tint class for the given risk level.
 */
export function getRiskBg(risk: RiskLevel): string {
	switch (risk) {
		case "CRITICAL":
			return "bg-crimson-bg";
		case "HIGH":
			return "bg-amber-bg";
		case "MEDIUM":
			return "bg-amber-bg/60";
		case "LOW":
			return "bg-sage-bg";
		default:
			return "bg-surface-1";
	}
}

/**
 * Converts a numeric score (0–100) into a RiskLevel.
 */
export function getRiskScore(score: number): RiskLevel {
	if (score >= 76) return "CRITICAL";
	if (score >= 51) return "HIGH";
	if (score >= 26) return "MEDIUM";
	return "LOW";
}

/**
 * Formats a 0–1 or 0–100 confidence value to a percentage string.
 * Values ≤ 1 are treated as fractions (e.g. 0.873 → "87.3%").
 */
export function formatConfidence(n: number): string {
	const pct = n <= 1 ? n * 100 : n;
	return `${pct.toFixed(1)}%`;
}

/**
 * Returns a human-readable relative time string (e.g. "2 hours ago").
 */
/**
 * Formats an ISO date string to "DD MMM YYYY HH:mm" (alias used by some panels).
 */
export function formatDateTime(iso: string): string {
	return formatDate(iso, true);
}

/**
 * Alias for formatTime — formats ISO string to "HH:mm:ss".
 */
export function formatTimestamp(iso: string): string {
	return formatTime(iso);
}

export function timeAgo(iso: string): string {
	return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

/**
 * Generates a short random hex ID (nanoid-style).
 */
export function generateId(): string {
	return (
		Math.random().toString(16).slice(2, 10) +
		Math.random().toString(16).slice(2, 10)
	);
}

/**
 * Returns a Tailwind text-color class for the given case status.
 */
export function getCaseStatusColor(status: CaseStatus): string {
	switch (status) {
		case "ACTIVE":
			return "text-amber";
		case "OPEN":
			return "text-sky";
		case "PENDING":
			return "text-amber-dim";
		case "CLOSED":
			return "text-sage";
		case "COLD":
			return "text-muted";
		default:
			return "text-muted";
	}
}
