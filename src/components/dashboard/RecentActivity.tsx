"use client";

import type { CaseActivity, Case } from "@/types";
import {
	FilePlus,
	Play,
	FileText,
	RefreshCw,
	MessageSquare,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { ElementType } from "react";

interface RecentActivityProps {
	activities: CaseActivity[];
	cases: Case[];
}

type ActivityType = CaseActivity["type"];

const ACTIVITY_ICONS: Record<ActivityType, ElementType> = {
	EVIDENCE_ADDED: FilePlus,
	ANALYSIS_RUN: Play,
	REPORT_GENERATED: FileText,
	STATUS_CHANGED: RefreshCw,
	NOTE_ADDED: MessageSquare,
};

export default function RecentActivity({
	activities,
	cases: _cases,
}: RecentActivityProps) {
	const sorted = [...activities]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 8);

	return (
		<div className="bg-surface-1">
			<div className="px-5 py-3 border-b border-border-DEFAULT">
				<p className="font-mono text-xs uppercase tracking-wider text-dim">
					RECENT ACTIVITY
				</p>
			</div>

			{sorted.length === 0 ? (
				<div className="flex items-center justify-center py-12">
					<span className="font-mono text-xs text-dim">
						NO ACTIVITY RECORDED
					</span>
				</div>
			) : (
				<ul className="divide-y divide-border-DEFAULT list-none p-0 m-0">
					{sorted.map((activity) => {
						const Icon = ACTIVITY_ICONS[activity.type] ?? RefreshCw;
						return (
							<li
								key={activity.id}
								className="flex items-start gap-3 px-5 py-3"
							>
								<span className="font-mono text-xs text-dim shrink-0 tabular-nums pt-0.5 w-[72px]">
									{timeAgo(activity.createdAt)}
								</span>
								<Icon
									size={13}
									strokeWidth={1.5}
									className="text-muted shrink-0 mt-0.5"
									aria-hidden="true"
								/>
								<span className="flex-1 font-sans text-xs text-data leading-snug">
									{activity.description}
								</span>
								<span className="font-mono text-xs text-dim shrink-0 truncate max-w-[96px] text-right">
									{activity.agent}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
