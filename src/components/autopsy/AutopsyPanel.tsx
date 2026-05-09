"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import type { AutopsyReport } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";

interface AutopsyPanelProps {
	caseId: string;
	existingReport?: AutopsyReport;
}

type MannerOfDeath =
	| "HOMICIDE"
	| "SUICIDE"
	| "NATURAL"
	| "ACCIDENTAL"
	| "UNDETERMINED";

function mannerVariant(
	manner: string,
): "crimson" | "amber" | "sage" | "sky" | "dim" {
	const m = manner.toUpperCase() as MannerOfDeath;
	if (m === "HOMICIDE") return "crimson";
	if (m === "SUICIDE") return "amber";
	if (m === "NATURAL") return "sage";
	if (m === "ACCIDENTAL") return "sky";
	return "dim";
}

interface FormState {
	rawReport: string;
	bodyTemperature: string;
	ambientTemperature: string;
	rigorMortisStage: string;
	livorMortisState: string;
}

const RIGOR_OPTIONS = [
	{ value: "0", label: "None" },
	{ value: "1", label: "Early Onset" },
	{ value: "2", label: "Full Rigor" },
	{ value: "3", label: "Resolving" },
];

const LIVOR_OPTIONS = [
	{ value: "not_present", label: "Not Present" },
	{ value: "faint", label: "Faint" },
	{ value: "well_defined", label: "Well-Defined" },
	{ value: "fixed", label: "Fixed" },
];

const labelClass =
	"block font-mono text-xs uppercase tracking-widest text-muted mb-1";
const inputClass =
	"w-full bg-surface-2 border border-border-DEFAULT text-data font-mono text-sm px-3 py-2 outline-none focus:border-amber placeholder:text-muted";
const selectClass =
	"w-full bg-surface-2 border border-border-DEFAULT text-data font-mono text-sm px-3 py-2 outline-none focus:border-amber";

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="font-mono text-xs uppercase tracking-widest text-muted mb-1 mt-4 first:mt-0">
			{children}
		</div>
	);
}

export function AutopsyPanel({ caseId, existingReport }: AutopsyPanelProps) {
	const [form, setForm] = useState<FormState>({
		rawReport: existingReport?.rawReport ?? "",
		bodyTemperature: existingReport?.bodyTemperature?.toString() ?? "",
		ambientTemperature: "",
		rigorMortisStage: existingReport?.rigorMortisStage?.toString() ?? "0",
		livorMortisState: existingReport?.livorMortisState ?? "not_present",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<AutopsyReport | null>(
		existingReport ?? null,
	);

	function handleChange(
		e: React.ChangeEvent<
			HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
		>,
	) {
		setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/analyze/autopsy", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					caseId,
					reportText: form.rawReport,
					bodyTemperature: parseFloat(form.bodyTemperature) || null,
					ambientTemperature: parseFloat(form.ambientTemperature) || null,
					rigorMortisStage: parseInt(form.rigorMortisStage, 10),
					livorMortisState: form.livorMortisState,
				}),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(
					(body as { error?: string }).error ?? `HTTP ${res.status}`,
				);
			}
			const data = (await res.json()) as AutopsyReport;
			setResult(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex gap-0 w-full min-h-[500px]">
			{/* LEFT PANE */}
			<div className="w-[40%] border-r border-border-DEFAULT p-4 flex flex-col gap-3">
				<div className="font-mono text-xs uppercase tracking-widest text-muted border-b border-border-DEFAULT pb-2">
					Autopsy Analysis Input
				</div>
				<form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
					<div>
						<label className={labelClass} htmlFor="rawReport">
							Raw Report Text
						</label>
						<textarea
							id="rawReport"
							name="rawReport"
							value={form.rawReport}
							onChange={handleChange}
							placeholder="Paste complete autopsy report..."
							className={`${inputClass} resize-y`}
							style={{
								minHeight: 300,
								fontFamily: "'JetBrains Mono', monospace",
							}}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className={labelClass} htmlFor="bodyTemperature">
								Body Temp (°C)
							</label>
							<input
								id="bodyTemperature"
								name="bodyTemperature"
								type="number"
								step="0.1"
								value={form.bodyTemperature}
								onChange={handleChange}
								className={inputClass}
								placeholder="e.g. 28.5"
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="ambientTemperature">
								Ambient Temp (°C)
							</label>
							<input
								id="ambientTemperature"
								name="ambientTemperature"
								type="number"
								step="0.1"
								value={form.ambientTemperature}
								onChange={handleChange}
								className={inputClass}
								placeholder="e.g. 20.0"
							/>
						</div>
					</div>

					<div>
						<label className={labelClass} htmlFor="rigorMortisStage">
							Rigor Mortis Stage
						</label>
						<select
							id="rigorMortisStage"
							name="rigorMortisStage"
							value={form.rigorMortisStage}
							onChange={handleChange}
							className={selectClass}
						>
							{RIGOR_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className={labelClass} htmlFor="livorMortisState">
							Livor Mortis State
						</label>
						<select
							id="livorMortisState"
							name="livorMortisState"
							value={form.livorMortisState}
							onChange={handleChange}
							className={selectClass}
						>
							{LIVOR_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>

					{error && (
						<div className="font-mono text-xs text-crimson border border-crimson px-3 py-2">
							ERROR: {error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-auto font-mono text-xs uppercase tracking-widest px-4 py-2.5 bg-amber text-base border border-amber disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ color: "var(--bg)", borderRadius: 0 }}
					>
						{loading ? "Processing..." : "Run Analysis"}
					</button>
				</form>
			</div>

			{/* RIGHT PANE */}
			<div className="flex-1 p-4 overflow-y-auto">
				<AnimatePresence mode="wait">
					{loading && (
						<motion.div
							key="loading"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="flex flex-col items-center justify-center h-full min-h-[300px] gap-2"
						>
							<span className="font-mono text-sm uppercase tracking-widest text-muted">
								Processing
							</span>
							<LoadingDots />
						</motion.div>
					)}

					{!loading && !result && (
						<motion.div
							key="empty"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-muted"
						>
							<FileText size={32} strokeWidth={1} className="text-muted" />
							<span className="font-mono text-xs uppercase tracking-widest">
								Submit Report for Analysis
							</span>
						</motion.div>
					)}

					{!loading && result && (
						<motion.div
							key="result"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="flex flex-col gap-1"
						>
							<div className="font-mono text-xs uppercase tracking-widest text-muted border-b border-border-DEFAULT pb-2 mb-3">
								Analysis Result — {formatDateTime(result.analyzedAt)}
							</div>

							<SectionLabel>Cause of Death</SectionLabel>
							<p className="font-mono text-sm text-data">
								{result.causeOfDeath}
							</p>

							<SectionLabel>Manner of Death</SectionLabel>
							<Badge variant={mannerVariant(result.mannerOfDeath)}>
								{result.mannerOfDeath}
							</Badge>

							<SectionLabel>Postmortem Interval</SectionLabel>
							<p className="font-mono text-sm text-data">
								{result.postmortemInterval}
							</p>

							<SectionLabel>Injury Pattern</SectionLabel>
							<p className="text-sm text-data leading-relaxed">
								{result.injuryPattern}
							</p>

							<SectionLabel>Toxicology</SectionLabel>
							<p
								className={`text-sm leading-relaxed ${
									result.toxicologyFindings &&
									result.toxicologyFindings.toLowerCase() !== "none" &&
									result.toxicologyFindings.toLowerCase() !== "negative" &&
									result.toxicologyFindings.trim() !== ""
										? "text-crimson"
										: "text-data"
								}`}
							>
								{result.toxicologyFindings ||
									"No toxicological substances detected."}
							</p>

							<SectionLabel>Wounds Catalog</SectionLabel>
							<p className="font-mono text-sm text-data">
								{result.woundsCount} wound{result.woundsCount !== 1 ? "s" : ""}{" "}
								documented
							</p>

							<SectionLabel>Analysis Confidence</SectionLabel>
							<div className="flex items-center gap-3">
								<ConfidenceBar
									value={result.confidence}
									height={4}
									className="flex-1"
								/>
								<span
									className="font-mono text-sm text-amber"
									style={{ minWidth: "4ch" }}
								>
									{result.confidence}%
								</span>
							</div>

							{result.analysisNotes && (
								<>
									<SectionLabel>Analysis Notes</SectionLabel>
									<p className="text-sm italic text-muted leading-relaxed">
										{result.analysisNotes}
									</p>
								</>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

function LoadingDots() {
	return (
		<div className="flex gap-1">
			{[0, 1, 2].map((i) => (
				<motion.span
					key={i}
					className="inline-block w-1.5 h-1.5 bg-amber"
					animate={{ opacity: [0.3, 1, 0.3] }}
					transition={{
						duration: 1.2,
						repeat: Infinity,
						delay: i * 0.2,
						ease: "easeInOut",
					}}
				/>
			))}
		</div>
	);
}

export default AutopsyPanel;
