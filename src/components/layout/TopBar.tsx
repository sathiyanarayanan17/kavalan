"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface TopBarProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
}

function pad(n: number) {
	return String(n).padStart(2, "0");
}

function formatClock(date: Date): string {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
	const [time, setTime] = useState<string>("");

	useEffect(() => {
		setTime(formatClock(new Date()));
		const id = setInterval(() => setTime(formatClock(new Date())), 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<header className="flex h-14 items-center justify-between border-b border-border-DEFAULT bg-surface-1 px-6">
			<div className="flex flex-col justify-center gap-0.5">
				<h1 className="font-mono text-sm uppercase tracking-wider text-data leading-none">
					{title}
				</h1>
				{subtitle && (
					<p className="font-mono text-xs text-dim leading-none">{subtitle}</p>
				)}
			</div>

			<div className="flex items-center gap-4">
				{actions}
				<span
					className="font-mono text-xs text-dim tabular-nums"
					aria-label="Current time"
				>
					{time}
				</span>
			</div>
		</header>
	);
}
