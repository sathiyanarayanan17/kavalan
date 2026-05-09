"use client";

import type { Case, CaseStatus } from "@/types";

interface CasePipelineProps {
	cases: Case[];
}

const PIPELINE_STATUSES: CaseStatus[] = [
	"OPEN",
	"ACTIVE",
	"PENDING",
	"CLOSED",
	"COLD",
];

const STATUS_BAR_CLASSES: Record<CaseStatus, string> = {
	OPEN: "bg-data",
	ACTIVE: "bg-amber",
	PENDING: "bg-sky",
	CLOSED: "bg-sage",
	COLD: "bg-dim",
};

const STATUS_TEXT_CLASSES: Record<CaseStatus, string> = {
	OPEN: "text-data",
	ACTIVE: "text-amber",
	PENDING: "text-sky",
	CLOSED: "text-sage",
	COLD: "text-dim",
};

export default function CasePipeline({ cases }: CasePipelineProps) {
	const counts = PIPELINE_STATUSES.reduce<Record<CaseStatus, number>>(
		(acc, status) => {
			acc[status] = cases.filter((c) => c.status === status).length;
			return acc;
		},
		{} as Record<CaseStatus, number>,
	);

	const max = Math.max(...Object.values(counts), 1);

	return (
		<div className="bg-surface-1">
			<div className="px-5 py-3 border-b border-border-DEFAULT">
				<p className="font-mono text-xs uppercase tracking-wider text-dim">
					CASE PIPELINE
				</p>
			</div>

			<div className="px-5 py-4 space-y-3">
				{PIPELINE_STATUSES.map((status) => {
					const count = counts[status];
					const pct = (count / max) * 100;

					return (
						<div key={status} className="flex items-center gap-3">
							{/* Status label */}
							<span
								className={`font-mono text-xs uppercase tracking-wider w-[60px] shrink-0 ${STATUS_TEXT_CLASSES[status]}`}
							>
								{status}
							</span>

							{/* Bar track */}
							<div className="flex-1 h-4 bg-surface-2 relative overflow-hidden">
								<div
									className={`absolute inset-y-0 left-0 ${STATUS_BAR_CLASSES[status]} transition-all duration-500`}
									style={{ width: `${pct}%` }}
									aria-hidden="true"
								/>
							</div>

							{/* Count */}
							<span className="font-mono text-xs text-data tabular-nums w-6 text-right shrink-0">
								{count}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
