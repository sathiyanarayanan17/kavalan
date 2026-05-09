"use client";

import type { EvidenceType } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface EvidenceTagProps {
	catalogRef: string;
	type: EvidenceType;
	confidence: number;
}

export function EvidenceTag({
	catalogRef,
	type,
	confidence,
}: EvidenceTagProps) {
	const pct = Math.max(0, Math.min(100, confidence));
	let fillColor: string;
	if (pct > 70) {
		fillColor = "var(--amber)";
	} else if (pct >= 40) {
		fillColor = "var(--sky)";
	} else {
		fillColor = "var(--crimson)";
	}

	return (
		<div className="inline-flex items-center gap-1.5">
			<span className="font-mono text-xs text-amber-dim">{catalogRef}</span>
			<Badge variant="dim">{type}</Badge>
			<div
				className="bg-surface-3"
				style={{ width: 48, height: 3, flexShrink: 0 }}
			>
				<div
					style={{
						width: `${pct}%`,
						height: "100%",
						background: fillColor,
					}}
				/>
			</div>
		</div>
	);
}
