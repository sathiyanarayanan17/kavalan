interface ConfidenceBarProps {
	value: number; // 0-100
	height?: number; // px, default 3
	showLabel?: boolean;
	className?: string;
}

export function ConfidenceBar({
	value,
	height = 3,
	showLabel = false,
	className = "",
}: ConfidenceBarProps) {
	const pct = Math.max(0, Math.min(100, value));
	let fillColor: string;
	if (pct >= 70) {
		fillColor = "var(--amber)";
	} else if (pct >= 40) {
		fillColor = "var(--sky)";
	} else {
		fillColor = "var(--crimson)";
	}

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div
				className="bg-surface-3 flex-1"
				style={{ height: `${height}px`, minWidth: 40 }}
			>
				<div
					style={{
						width: `${pct}%`,
						height: "100%",
						background: fillColor,
						transition: "width 0.4s ease-out",
					}}
				/>
			</div>
			{showLabel && (
				<span
					className="font-mono text-xs text-muted"
					style={{ minWidth: "3ch" }}
				>
					{pct}%
				</span>
			)}
		</div>
	);
}
