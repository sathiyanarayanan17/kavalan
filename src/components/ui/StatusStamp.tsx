import type { CaseStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusStampProps {
	status: CaseStatus;
	className?: string;
}

type StampConfig = {
	color: string;
	border: string;
	rotation: string;
};

const STATUS_CONFIG: Record<CaseStatus, StampConfig> = {
	ACTIVE: {
		color: "text-amber",
		border: "border-amber",
		rotation: "-rotate-1",
	},
	OPEN: {
		color: "text-data",
		border: "border-border-strong",
		rotation: "rotate-0",
	},
	PENDING: {
		color: "text-sky",
		border: "border-sky",
		rotation: "rotate-0",
	},
	CLOSED: {
		color: "text-sage",
		border: "border-sage",
		rotation: "rotate-1",
	},
	COLD: {
		color: "text-dim",
		border: "border-border-DEFAULT",
		rotation: "rotate-0",
	},
};

export function StatusStamp({ status, className }: StatusStampProps) {
	const { color, border, rotation } = STATUS_CONFIG[status];
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center px-3 py-1",
				"font-mono text-xs font-bold uppercase tracking-widest",
				"border-2",
				color,
				border,
				rotation,
				className,
			)}
			aria-label={`Status: ${status}`}
		>
			{status}
		</span>
	);
}
