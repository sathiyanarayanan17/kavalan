"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusStamp } from "@/components/ui/StatusStamp";
import type { Case } from "@/types";

const TABS = [
	{ label: "OVERVIEW", path: "" },
	{ label: "AUTOPSY", path: "/autopsy" },
	{ label: "TIME OF DEATH", path: "/tod" },
	{ label: "DIGITAL EVIDENCE", path: "/digital" },
	{ label: "TIMELINE", path: "/timeline" },
];

export default function CaseWorkspaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams<{ id: string }>();
	const pathname = usePathname();
	const id = params?.id;

	const [caseData, setCaseData] = useState<Case | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		const load = async () => {
			try {
				const res = await fetch(`/api/cases/${id}`);
				if (!res.ok) throw new Error("Case not found");
				const data = await res.json();
				setCaseData(data.case ?? data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	if (loading) {
		return (
			<AppShell sidebar={<Sidebar />}>
				<div className="flex items-center justify-center h-64">
					<span
						className="font-mono text-sm"
						style={{ color: "var(--text-dim)" }}
					>
						LOADING...
					</span>
				</div>
			</AppShell>
		);
	}

	if (error || !caseData) {
		return (
			<AppShell sidebar={<Sidebar />}>
				<div className="flex items-center justify-center h-64">
					<span
						className="font-mono text-sm"
						style={{ color: "var(--critical)" }}
					>
						{error ?? "CASE NOT FOUND"}
					</span>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell sidebar={<Sidebar />}>
			<TopBar
				title={caseData.caseRef}
				subtitle={caseData.title}
				actions={
					<div className="flex items-center gap-2">
						<RiskBadge level={caseData.riskLevel} score={caseData.riskScore} />
						<StatusStamp status={caseData.status} />
					</div>
				}
			/>

			{/* Tab navigation */}
			<div
				style={{
					background: "var(--bg-surface-1)",
					borderBottom: "1px solid var(--border)",
				}}
			>
				<nav className="flex px-6" style={{ gap: 0 }}>
					{TABS.map((tab) => {
						const href = `/cases/${id}${tab.path}`;
						const isActive =
							tab.path === ""
								? pathname === `/cases/${id}`
								: pathname?.startsWith(href);
						return (
							<Link
								key={tab.label}
								href={href}
								style={{
									display: "inline-block",
									padding: "10px 16px",
									fontFamily: "var(--font-mono, monospace)",
									fontSize: "11px",
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									color: isActive ? "var(--amber)" : "var(--text-dim)",
									borderBottom: isActive
										? "2px solid var(--amber)"
										: "2px solid transparent",
									textDecoration: "none",
									whiteSpace: "nowrap",
									transition: "color 0.15s",
								}}
							>
								{tab.label}
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Tab content */}
			{children}
		</AppShell>
	);
}
