"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
	Camera,
	Phone,
	MapPin,
	DollarSign,
	Share2,
	Mail,
	Globe,
} from "lucide-react";
import type {
	DigitalEvidence,
	DigitalSourceType,
	AutopsyReport,
	TodEstimate,
} from "@/types";
import { formatTimestamp } from "@/lib/utils";

interface TimelineRailProps {
	digitalEvidence: DigitalEvidence[];
	autopsyReport?: AutopsyReport;
	todEstimate?: TodEstimate;
	caseId: string;
}

interface TooltipState {
	ev: DigitalEvidence;
	x: number;
	y: number;
}

const SOURCE_COLORS: Record<DigitalSourceType, string> = {
	CCTV: "var(--amber)",
	MOBILE: "var(--sky)",
	GPS: "var(--sage)",
	FINANCIAL: "var(--amber-dim)",
	SOCIAL: "var(--sky)",
	EMAIL: "var(--muted)",
	BROWSER: "var(--muted)",
};

const SOURCE_LABELS: Record<DigitalSourceType, string> = {
	CCTV: "CCTV",
	MOBILE: "Mobile",
	GPS: "GPS",
	FINANCIAL: "Financial",
	SOCIAL: "Social",
	EMAIL: "Email",
	BROWSER: "Browser",
};

function SourceIcon({
	type,
	size = 12,
}: {
	type: DigitalSourceType;
	size?: number;
}) {
	const props = { size, strokeWidth: 1.5 };
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

const RAIL_HEIGHT = 80;
const DOT_Y = RAIL_HEIGHT / 2;
const PADDING_X = 40;
const MIN_RAIL_WIDTH = 800;

export function TimelineRail({
	digitalEvidence,
	autopsyReport,
	todEstimate,
}: TimelineRailProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);

	const sorted = [...digitalEvidence].sort((a, b) =>
		a.timestamp.localeCompare(b.timestamp),
	);

	if (sorted.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<span className="font-mono text-xs uppercase tracking-widest text-muted">
					No Digital Evidence to Display
				</span>
			</div>
		);
	}

	const earliest = new Date(sorted[0].timestamp).getTime();
	const latest = new Date(sorted[sorted.length - 1].timestamp).getTime();
	const span = latest - earliest || 1;

	const railWidth = Math.max(
		MIN_RAIL_WIDTH,
		sorted.length * 20 + PADDING_X * 2,
	);

	function timeToX(ts: string): number {
		const t = new Date(ts).getTime();
		return PADDING_X + ((t - earliest) / span) * (railWidth - PADDING_X * 2);
	}

	// Tick marks at regular intervals
	const tickCount = 6;
	const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
		const t = earliest + (span / tickCount) * i;
		return { x: PADDING_X + (i / tickCount) * (railWidth - PADDING_X * 2), t };
	});

	// Present source types for legend
	const presentTypes = Array.from(new Set(sorted.map((e) => e.sourceType)));

	// TOD window
	let todWindowX1 = 0;
	let todWindowX2 = 0;
	let todWindowVisible = false;
	if (todEstimate?.estimatedTodEarliest && todEstimate?.estimatedTodLatest) {
		const t1 = new Date(todEstimate.estimatedTodEarliest).getTime();
		const t2 = new Date(todEstimate.estimatedTodLatest).getTime();
		if (t1 >= earliest - span * 0.1 && t2 <= latest + span * 0.1) {
			todWindowX1 =
				PADDING_X + ((t1 - earliest) / span) * (railWidth - PADDING_X * 2);
			todWindowX2 =
				PADDING_X + ((t2 - earliest) / span) * (railWidth - PADDING_X * 2);
			todWindowVisible = true;
		}
	}

	// Autopsy TOD line
	let autopsyX: number | null = null;
	if (autopsyReport?.analyzedAt) {
		const t = new Date(autopsyReport.analyzedAt).getTime();
		if (t >= earliest && t <= latest) {
			autopsyX = timeToX(autopsyReport.analyzedAt);
		}
	}

	const handleDotEnter = useCallback((ev: DigitalEvidence, dotX: number) => {
		setTooltip({ ev, x: dotX, y: DOT_Y });
	}, []);

	const handleDotLeave = useCallback(() => {
		setTooltip(null);
	}, []);

	return (
		<div className="flex flex-col gap-2 w-full">
			{/* Tick labels row */}
			<div className="overflow-x-auto" ref={containerRef}>
				<div style={{ width: railWidth, position: "relative" }}>
					{/* Timestamp ticks */}
					<div style={{ height: 20, position: "relative" }}>
						{ticks.map((tick, i) => (
							<span
								key={i}
								className="font-mono text-xs absolute"
								style={{
									left: tick.x,
									top: 2,
									transform: "translateX(-50%)",
									color: "var(--dim)",
									whiteSpace: "nowrap",
									fontSize: 10,
								}}
							>
								{new Date(tick.t).toLocaleString("en-US", {
									month: "2-digit",
									day: "2-digit",
									hour: "2-digit",
									minute: "2-digit",
									hour12: false,
								})}
							</span>
						))}
					</div>

					{/* SVG rail */}
					<svg
						width={railWidth}
						height={RAIL_HEIGHT}
						style={{ display: "block", overflow: "visible" }}
					>
						{/* Base line */}
						<line
							x1={PADDING_X}
							y1={DOT_Y}
							x2={railWidth - PADDING_X}
							y2={DOT_Y}
							stroke="var(--border-strong)"
							strokeWidth={1}
						/>

						{/* TOD window band */}
						{todWindowVisible && (
							<rect
								x={todWindowX1}
								y={0}
								width={todWindowX2 - todWindowX1}
								height={RAIL_HEIGHT}
								fill="var(--crimson)"
								fillOpacity={0.18}
							/>
						)}
						{todWindowVisible && (
							<text
								x={(todWindowX1 + todWindowX2) / 2}
								y={12}
								textAnchor="middle"
								style={{
									fontFamily: "'JetBrains Mono', monospace",
									fontSize: 9,
									fill: "var(--crimson)",
									letterSpacing: "0.08em",
								}}
							>
								EST. TOD WINDOW
							</text>
						)}

						{/* Autopsy TOD line */}
						{autopsyX !== null && (
							<>
								<line
									x1={autopsyX}
									y1={0}
									x2={autopsyX}
									y2={RAIL_HEIGHT}
									stroke="var(--crimson)"
									strokeWidth={1.5}
									strokeDasharray="4 3"
								/>
								<text
									x={autopsyX + 4}
									y={RAIL_HEIGHT - 6}
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										fontSize: 9,
										fill: "var(--crimson)",
									}}
								>
									TOD
								</text>
							</>
						)}

						{/* Tick lines */}
						{ticks.map((tick, i) => (
							<line
								key={i}
								x1={tick.x}
								y1={DOT_Y - 6}
								x2={tick.x}
								y2={DOT_Y + 6}
								stroke="var(--border)"
								strokeWidth={1}
							/>
						))}

						{/* Event dots */}
						{sorted.map((ev, i) => {
							const x = timeToX(ev.timestamp);
							const isAnomaly = ev.anomalyScore > 70;
							const r = isAnomaly ? 6 : 4;
							const color = SOURCE_COLORS[ev.sourceType] ?? "var(--muted)";
							return (
								<motion.circle
									key={ev.id}
									cx={x}
									cy={DOT_Y}
									r={r}
									fill={color}
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{
										duration: 0.25,
										ease: "easeOut",
										delay: i * 0.01,
									}}
									style={{ cursor: "pointer" }}
									onMouseEnter={() => handleDotEnter(ev, x)}
									onMouseLeave={handleDotLeave}
								/>
							);
						})}
					</svg>

					{/* Tooltip */}
					{tooltip && (
						<motion.div
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className="absolute z-10 bg-surface-2 border border-border-DEFAULT p-2 pointer-events-none"
							style={{
								left: Math.min(tooltip.x, railWidth - 220),
								top: DOT_Y + 20 + 20, // +20 for tick row
								width: 200,
							}}
						>
							<div className="font-mono text-xs text-muted uppercase tracking-wider mb-1">
								{tooltip.ev.sourceType} — {tooltip.ev.sourceName}
							</div>
							<div className="font-mono text-xs text-data mb-0.5">
								{formatTimestamp(tooltip.ev.timestamp)}
							</div>
							<div className="text-xs text-data mb-0.5">
								{tooltip.ev.subject}
							</div>
							<div className="text-xs text-muted">{tooltip.ev.description}</div>
							{tooltip.ev.location && (
								<div className="text-xs text-muted mt-0.5">
									{tooltip.ev.location}
								</div>
							)}
							{tooltip.ev.anomalyScore > 0 && (
								<div
									className="font-mono text-xs mt-1"
									style={{
										color:
											tooltip.ev.anomalyScore > 70
												? "var(--crimson)"
												: "var(--amber)",
									}}
								>
									Anomaly: {tooltip.ev.anomalyScore}
								</div>
							)}
						</motion.div>
					)}
				</div>
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-3 px-1 pt-1">
				{presentTypes.map((type) => (
					<div key={type} className="flex items-center gap-1.5">
						<div
							className="rounded-full flex-shrink-0"
							style={{
								width: 8,
								height: 8,
								background: SOURCE_COLORS[type] ?? "var(--muted)",
							}}
						/>
						<span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
							<SourceIcon type={type} size={10} />
							{SOURCE_LABELS[type]}
						</span>
					</div>
				))}
				{todWindowVisible && (
					<div className="flex items-center gap-1.5">
						<div
							className="flex-shrink-0"
							style={{
								width: 12,
								height: 8,
								background: "var(--crimson)",
								opacity: 0.4,
							}}
						/>
						<span className="font-mono text-xs text-muted">TOD Window</span>
					</div>
				)}
			</div>
		</div>
	);
}
