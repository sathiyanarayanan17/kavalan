"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Camera,
	Phone,
	MapPin,
	DollarSign,
	Share2,
	Mail,
	Globe,
} from "lucide-react";
import type { DigitalEvidence, DigitalSourceType } from "@/types";
import { formatTimestamp } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";

interface DigitalPanelProps {
	caseId: string;
	digitalEvidence: DigitalEvidence[];
}

interface CorrelationResult {
	anomalies: {
		severity: string;
		type: string;
		description: string;
		timestamps: string[];
	}[];
	patterns: { label: string; confidence: number }[];
	digitalRisk: number;
}

function SourceIcon({ type }: { type: DigitalSourceType }) {
	const props = { size: 14, strokeWidth: 1.5, className: "inline-block" };
	switch (type) {
		case "CCTV":
			return <Camera {...props} />;
		case "MOBILE":
			return <Phone {...props} />;
		case "GPS":
			return <MapPin {...props} />;
		case "FINANCIAL":
			return <DollarSign {...props} />;
		case "SOCIAL":
			return <Share2 {...props} />;
		case "EMAIL":
			return <Mail {...props} />;
		case "BROWSER":
			return <Globe {...props} />;
		default:
			return null;
	}
}

function anomalyColor(score: number): string {
	if (score > 70) return "var(--crimson)";
	if (score >= 40) return "var(--amber)";
	return "var(--sage)";
}

function anomalyTextClass(score: number): string {
	if (score > 70) return "text-crimson";
	if (score >= 40) return "text-amber";
	return "text-sage";
}

function severityVariant(
	severity: string,
): "crimson" | "amber" | "sage" | "dim" {
	const s = severity.toUpperCase();
	if (s === "HIGH" || s === "CRITICAL") return "crimson";
	if (s === "MEDIUM") return "amber";
	if (s === "LOW") return "sage";
	return "dim";
}

function groupByDay(
	evts: DigitalEvidence[],
): { date: string; items: DigitalEvidence[] }[] {
	const map = new Map<string, DigitalEvidence[]>();
	for (const e of evts) {
		const d = e.timestamp ? e.timestamp.slice(0, 10) : "unknown";
		const arr = map.get(d) ?? [];
		arr.push(e);
		map.set(d, arr);
	}
	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, items]) => ({ date, items }));
}

export function DigitalPanel({ caseId, digitalEvidence }: DigitalPanelProps) {
	const [correlating, setCorrelating] = useState(false);
	const [correlationError, setCorrelationError] = useState<string | null>(null);
	const [correlationResult, setCorrelationResult] =
		useState<CorrelationResult | null>(null);

	const sortedEvidence = useMemo(
		() =>
			[...digitalEvidence].sort((a, b) =>
				a.timestamp.localeCompare(b.timestamp),
			),
		[digitalEvidence],
	);

	const grouped = useMemo(() => groupByDay(sortedEvidence), [sortedEvidence]);

	async function handleRunCorrelation() {
		setCorrelating(true);
		setCorrelationError(null);
		try {
			const res = await fetch("/api/analyze/digital", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ caseId }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(
					(body as { error?: string }).error ?? `HTTP ${res.status}`,
				);
			}
			const data = (await res.json()) as CorrelationResult;
			setCorrelationResult(data);
		} catch (err) {
			setCorrelationError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setCorrelating(false);
		}
	}

	return (
		<div className="flex flex-col gap-0 w-full">
			{/* ─── SECTION 1: EVIDENCE INVENTORY ─── */}
			<section className="border-b border-border-DEFAULT">
				<div className="px-4 py-2 border-b border-border-DEFAULT bg-surface-1">
					<span className="font-mono text-xs uppercase tracking-widest text-muted">
						Evidence Inventory
					</span>
					<span className="font-mono text-xs text-muted ml-2">
						({digitalEvidence.length})
					</span>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							<tr className="border-b border-border-DEFAULT">
								{[
									"Type",
									"Source",
									"Timestamp",
									"Subject",
									"Location",
									"Anomaly",
									"Confidence",
								].map((h) => (
									<th
										key={h}
										className="px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted whitespace-nowrap"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{sortedEvidence.length === 0 && (
								<tr>
									<td
										colSpan={7}
										className="px-3 py-6 text-center font-mono text-xs text-muted uppercase tracking-widest"
									>
										No Digital Evidence
									</td>
								</tr>
							)}
							{sortedEvidence.map((ev, i) => (
								<motion.tr
									key={ev.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.25,
										ease: "easeOut",
										delay: i * 0.015,
									}}
									className="border-t border-border-DEFAULT hover:bg-surface-2"
								>
									<td className="px-3 py-2 whitespace-nowrap">
										<span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
											<SourceIcon type={ev.sourceType} />
											{ev.sourceType}
										</span>
									</td>
									<td className="px-3 py-2 text-sm text-data max-w-[120px] truncate">
										{ev.sourceName}
									</td>
									<td className="px-3 py-2 font-mono text-xs text-muted whitespace-nowrap">
										{formatTimestamp(ev.timestamp)}
									</td>
									<td className="px-3 py-2 text-sm text-data max-w-[140px] truncate">
										{ev.subject}
									</td>
									<td className="px-3 py-2 text-sm text-muted max-w-[120px] truncate">
										{ev.location}
									</td>
									<td className="px-3 py-2 whitespace-nowrap">
										<div className="flex items-center gap-1.5">
											<span
												className={`font-mono text-xs ${anomalyTextClass(ev.anomalyScore)}`}
											>
												{ev.anomalyScore}
											</span>
											<div
												className="bg-surface-3"
												style={{ width: 32, height: 3 }}
											>
												<div
													style={{
														width: `${ev.anomalyScore}%`,
														height: "100%",
														background: anomalyColor(ev.anomalyScore),
													}}
												/>
											</div>
										</div>
									</td>
									<td className="px-3 py-2">
										<ConfidenceBar value={ev.confidence} height={3} showLabel />
									</td>
								</motion.tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* ─── SECTION 2: CORRELATION ANALYSIS ─── */}
			<section className="border-b border-border-DEFAULT">
				<div className="px-4 py-2 border-b border-border-DEFAULT bg-surface-1">
					<span className="font-mono text-xs uppercase tracking-widest text-muted">
						Correlation Analysis
					</span>
				</div>
				<div className="p-4">
					<button
						onClick={handleRunCorrelation}
						disabled={correlating}
						className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-amber text-amber disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ borderRadius: 0 }}
					>
						{correlating ? "Correlating..." : "Run Correlation Analysis"}
					</button>

					{correlationError && (
						<div className="mt-3 font-mono text-xs text-crimson border border-crimson px-3 py-2">
							ERROR: {correlationError}
						</div>
					)}

					<AnimatePresence>
						{correlationResult && (
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className="mt-4 flex flex-col gap-4"
							>
								{/* Anomalies */}
								<div>
									<div className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
										Anomalies Detected ({correlationResult.anomalies.length})
									</div>
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-b border-border-DEFAULT">
												{[
													"Severity",
													"Type",
													"Description",
													"Affected Timestamps",
												].map((h) => (
													<th
														key={h}
														className="px-3 py-1.5 text-left font-mono text-xs uppercase tracking-wider text-muted"
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{correlationResult.anomalies.map((a, i) => (
												<motion.tr
													key={i}
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.25,
														ease: "easeOut",
														delay: i * 0.04,
													}}
													className="border-t border-border-DEFAULT"
												>
													<td className="px-3 py-2">
														<Badge variant={severityVariant(a.severity)}>
															{a.severity}
														</Badge>
													</td>
													<td className="px-3 py-2 font-mono text-xs text-data">
														{a.type}
													</td>
													<td className="px-3 py-2 text-sm text-data max-w-[240px]">
														{a.description}
													</td>
													<td className="px-3 py-2 font-mono text-xs text-muted">
														{a.timestamps
															.map((t) => formatTimestamp(t))
															.join(", ")}
													</td>
												</motion.tr>
											))}
											{correlationResult.anomalies.length === 0 && (
												<tr>
													<td
														colSpan={4}
														className="px-3 py-4 text-center font-mono text-xs text-muted uppercase tracking-widest"
													>
														No Anomalies Detected
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>

								{/* Patterns */}
								<div>
									<div className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
										Identified Patterns
									</div>
									<div className="flex flex-col gap-1.5">
										{correlationResult.patterns.map((p, i) => (
											<motion.div
												key={i}
												initial={{ opacity: 0, y: 8 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													duration: 0.25,
													ease: "easeOut",
													delay: i * 0.04,
												}}
												className="flex items-center gap-3 bg-surface-2 px-3 py-2"
											>
												<span className="text-sm text-data flex-1">
													{p.label}
												</span>
												<ConfidenceBar
													value={p.confidence}
													height={3}
													className="w-24"
												/>
												<span
													className="font-mono text-xs text-muted"
													style={{ minWidth: "4ch" }}
												>
													{p.confidence}%
												</span>
											</motion.div>
										))}
										{correlationResult.patterns.length === 0 && (
											<p className="font-mono text-xs text-muted uppercase tracking-widest">
												No patterns identified
											</p>
										)}
									</div>
								</div>

								{/* Digital Risk */}
								<div className="flex items-center gap-3 border-t border-border-DEFAULT pt-3">
									<span className="font-mono text-xs uppercase tracking-widest text-muted">
										Digital Risk Contribution:
									</span>
									<span
										className="font-mono text-sm"
										style={{
											color: anomalyColor(correlationResult.digitalRisk),
										}}
									>
										{correlationResult.digitalRisk}/100
									</span>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</section>

			{/* ─── SECTION 3: TIMELINE VIEW ─── */}
			<section>
				<div className="px-4 py-2 border-b border-border-DEFAULT bg-surface-1">
					<span className="font-mono text-xs uppercase tracking-widest text-muted">
						Chronological Timeline
					</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse" style={{ minWidth: 640 }}>
						<thead>
							<tr className="border-b border-border-DEFAULT">
								{["Time", "Source", "Subject", "Description", "Location"].map(
									(h) => (
										<th
											key={h}
											className="px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted whitespace-nowrap"
										>
											{h}
										</th>
									),
								)}
							</tr>
						</thead>
						<tbody>
							{grouped.map(({ date, items }) => (
								<>
									<tr
										key={`sep-${date}`}
										className="border-t border-border-DEFAULT bg-surface-2"
									>
										<td colSpan={5} className="px-3 py-1">
											<span className="font-mono text-xs uppercase tracking-widest text-muted">
												{date}
											</span>
										</td>
									</tr>
									{items.map((ev, i) => (
										<motion.tr
											key={ev.id}
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.25,
												ease: "easeOut",
												delay: i * 0.015,
											}}
											className="border-t border-border-DEFAULT hover:bg-surface-2"
											style={
												ev.anomalyScore > 70
													? { borderLeft: "2px solid var(--crimson)" }
													: undefined
											}
										>
											<td className="px-3 py-2 font-mono text-xs text-muted whitespace-nowrap">
												{ev.timestamp ? ev.timestamp.slice(11, 19) : "—"}
											</td>
											<td className="px-3 py-2 whitespace-nowrap">
												<span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
													<SourceIcon type={ev.sourceType} />
													{ev.sourceType}
												</span>
											</td>
											<td className="px-3 py-2 text-sm text-data max-w-[140px] truncate">
												{ev.subject}
											</td>
											<td className="px-3 py-2 text-sm text-data max-w-[200px]">
												{ev.description}
											</td>
											<td className="px-3 py-2 text-sm text-muted max-w-[120px] truncate">
												{ev.location}
											</td>
										</motion.tr>
									))}
								</>
							))}
							{grouped.length === 0 && (
								<tr>
									<td
										colSpan={5}
										className="px-3 py-6 text-center font-mono text-xs text-muted uppercase tracking-widest"
									>
										No Events
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
