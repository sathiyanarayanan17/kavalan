"use client";

import type { Case, RiskLevel } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RiskDistributionProps {
	cases: Case[];
}

const RISK_LEVELS: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const RISK_COLORS: Record<RiskLevel, string> = {
	CRITICAL: "var(--crimson)",
	HIGH: "var(--amber)",
	MEDIUM: "var(--sky)",
	LOW: "var(--sage)",
};

const RISK_VARIANT_CLASSES: Record<RiskLevel, { text: string; bg: string }> = {
	CRITICAL: { text: "text-crimson", bg: "bg-crimson" },
	HIGH: { text: "text-amber", bg: "bg-amber" },
	MEDIUM: { text: "text-sky", bg: "bg-sky" },
	LOW: { text: "text-sage", bg: "bg-sage" },
};

export default function RiskDistribution({ cases }: RiskDistributionProps) {
	const total = cases.length;

	const data = RISK_LEVELS.map((level) => ({
		level,
		count: cases.filter((c) => c.riskLevel === level).length,
	})).filter((d) => d.count > 0);

	return (
		<div className="bg-surface-1 p-5">
			<p className="mb-4 font-mono text-xs uppercase tracking-wider text-dim">
				RISK DISTRIBUTION
			</p>

			<div className="flex flex-col items-center">
				<div className="relative" style={{ width: 240, height: 240 }}>
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								dataKey="count"
								nameKey="level"
								innerRadius={55}
								outerRadius={80}
								paddingAngle={2}
								startAngle={90}
								endAngle={-270}
								strokeWidth={0}
							>
								{data.map((entry) => (
									<Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									background: "var(--surface-2)",
									border: "1px solid var(--border)",
									borderRadius: 0,
									fontFamily: "JetBrains Mono, monospace",
									fontSize: 11,
									color: "var(--data)",
								}}
								itemStyle={{ color: "var(--data)" }}
								formatter={(value: number, name: string) => [
									`${value} cases`,
									name,
								]}
							/>
						</PieChart>
					</ResponsiveContainer>

					{/* Donut center label */}
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
						<span className="font-mono text-2xl leading-none text-data tabular-nums">
							{total}
						</span>
						<span className="font-mono text-xs text-dim mt-0.5">CASES</span>
					</div>
				</div>

				{/* Legend */}
				<ul className="mt-4 w-full space-y-2 list-none p-0 m-0">
					{RISK_LEVELS.map((level) => {
						const count = cases.filter((c) => c.riskLevel === level).length;
						const pct = total > 0 ? Math.round((count / total) * 100) : 0;
						const { text, bg } = RISK_VARIANT_CLASSES[level];
						return (
							<li key={level} className="flex items-center gap-2">
								<span
									className={`h-2.5 w-2.5 shrink-0 ${bg}`}
									aria-hidden="true"
								/>
								<span
									className={`font-mono text-xs uppercase tracking-wider flex-1 ${text}`}
								>
									{level}
								</span>
								<span className="font-mono text-xs text-data tabular-nums">
									{count}
								</span>
								<span className="font-mono text-xs text-dim tabular-nums w-8 text-right">
									{pct}%
								</span>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
