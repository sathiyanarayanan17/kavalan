import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "amber" | "crimson" | "sage" | "sky" | "dim";
type BadgeSize = "sm" | "md";

interface BadgeProps {
	children: ReactNode;
	variant?: BadgeVariant;
	size?: BadgeSize;
	className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
	default: "bg-surface-3 text-data border border-border-DEFAULT",
	amber: "bg-amber-bg text-amber border border-amber/30",
	crimson: "bg-crimson-bg text-crimson border border-crimson/30",
	sage: "bg-sage-bg text-sage border border-sage/30",
	sky: "bg-sky-bg text-sky border border-sky/30",
	dim: "bg-surface-2 text-dim border border-border-DEFAULT",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
	sm: "px-1.5 py-px text-[10px]",
	md: "px-2 py-0.5 text-xs",
};

export function Badge({
	children,
	variant = "default",
	size = "md",
	className,
}: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center font-mono uppercase tracking-wider rounded-sm",
				VARIANT_CLASSES[variant],
				SIZE_CLASSES[size],
				className,
			)}
		>
			{children}
		</span>
	);
}
