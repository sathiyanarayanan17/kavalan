"use client";

import { useEffect, useRef, useState } from "react";
import type { RiskLevel } from "@/types";

interface RiskGaugeProps {
	score: number;
	size?: number;
}

function getRiskLevel(score: number): RiskLevel {
	if (score <= 25) return "LOW";
	if (score <= 50) return "MEDIUM";
	if (score <= 75) return "HIGH";
	return "CRITICAL";
}

function getRiskColor(score: number): string {
	if (score <= 25) return "var(--sage)";
	if (score <= 50) return "var(--sky)";
	if (score <= 75) return "var(--amber)";
	return "var(--crimson)";
}

export function RiskGauge({ score, size = 200 }: RiskGaugeProps) {
	const clamped = Math.max(0, Math.min(100, score));
	const [animatedScore, setAnimatedScore] = useState(0);
	const frameRef = useRef<number | null>(null);
	const startRef = useRef<number | null>(null);

	useEffect(() => {
		const duration = 700; // ms
		const from = 0;
		const to = clamped;

		function animate(now: number) {
			if (startRef.current === null) startRef.current = now;
			const elapsed = now - startRef.current;
			const t = Math.min(elapsed / duration, 1);
			// ease-out cubic
			const eased = 1 - (1 - t) ** 3;
			setAnimatedScore(from + (to - from) * eased);
			if (t < 1) {
				frameRef.current = requestAnimationFrame(animate);
			}
		}

		frameRef.current = requestAnimationFrame(animate);
		return () => {
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		};
	}, [clamped]);

	const cx = size / 2;
	const cy = size / 2;
	const radius = (size / 2) * 0.72;
	const strokeWidth = (size / 2) * 0.1;

	// 180° arc: starts at left (180°) goes to right (0°) — a top semicircle
	// We draw the arc from 180° to 0° going through the top (counter-clockwise in SVG)
	// In SVG: 0° = right, 90° = bottom.
	// We want a bottom-half semicircle (open at top), so: 210° to 330° as a 180° arc
	// Actually let's do a standard gauge: starts at -210° (bottom-left), ends at 30° (bottom-right)
	// = 240° total arc for a gauge. But spec says 180°. Let's do top half open at bottom.
	// Arc from 180° to 0° (left to right, going up over top).

	// Path for 180° arc (from left → up → right)
	// Start point: left side of circle at middle height
	// End point: right side of circle at middle height

	const startAngle = Math.PI; // 180° in radians = left side
	const endAngle = 0; // 0° = right side

	function polarToXY(angleDeg: number) {
		const rad = (angleDeg * Math.PI) / 180;
		return {
			x: cx + radius * Math.cos(rad),
			y: cy + radius * Math.sin(rad),
		};
	}

	// Background arc: 180° → 360° (going from left, through top, to right)
	// In SVG coordinate space: angles go clockwise. 0° = right, 90° = down, 180° = left, 270° = up
	// We want the gauge to go from left (180°) through top (270°) to right (360°/0°)
	const bgStart = polarToXY(180);
	const bgEnd = polarToXY(360);

	const bgPath = [
		`M ${bgStart.x} ${bgStart.y}`,
		`A ${radius} ${radius} 0 0 1 ${bgEnd.x} ${bgEnd.y}`,
	].join(" ");

	// Filled arc: proportion of 180° based on animatedScore
	const fillAngle = 180 + (animatedScore / 100) * 180;
	const fillEnd = polarToXY(fillAngle);
	const largeArc = fillAngle - 180 >= 180 ? 1 : 0;

	const fillPath = [
		`M ${bgStart.x} ${bgStart.y}`,
		`A ${radius} ${radius} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`,
	].join(" ");

	const level = getRiskLevel(clamped);
	const color = getRiskColor(clamped);

	const displayScore = Math.round(animatedScore);

	const labelYOffset = cy + radius * 0.35;
	const scoreFontSize = size * 0.18;
	const levelFontSize = size * 0.07;

	return (
		<div
			className="inline-flex flex-col items-center"
			style={{ width: size, height: size * 0.6 }}
		>
			<svg
				width={size}
				height={size * 0.6}
				viewBox={`0 0 ${size} ${size}`}
				aria-label={`Risk score ${clamped} — ${level}`}
			>
				{/* Background arc */}
				<path
					d={bgPath}
					fill="none"
					stroke="var(--border-strong)"
					strokeWidth={strokeWidth}
					strokeLinecap="butt"
				/>
				{/* Filled arc */}
				{animatedScore > 0 && (
					<path
						d={fillPath}
						fill="none"
						stroke={color}
						strokeWidth={strokeWidth}
						strokeLinecap="butt"
					/>
				)}
				{/* Score label */}
				<text
					x={cx}
					y={labelYOffset}
					textAnchor="middle"
					dominantBaseline="middle"
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						fontSize: scoreFontSize,
						fill: "var(--data)",
						fontWeight: 600,
					}}
				>
					{displayScore}
				</text>
				{/* Level label */}
				<text
					x={cx}
					y={labelYOffset + scoreFontSize * 0.85}
					textAnchor="middle"
					dominantBaseline="middle"
					style={{
						fontFamily: "'JetBrains Mono', monospace",
						fontSize: levelFontSize,
						fill: "var(--dim)",
						letterSpacing: "0.12em",
						textTransform: "uppercase",
					}}
				>
					{level}
				</text>
			</svg>
		</div>
	);
}

export default RiskGauge;
