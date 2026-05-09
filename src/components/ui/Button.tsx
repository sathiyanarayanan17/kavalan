import type { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	onClick?: () => void;
	href?: string;
	disabled?: boolean;
	type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
	className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary:
		"bg-amber text-black font-mono text-xs uppercase tracking-wider hover:bg-amber-dim disabled:opacity-50",
	secondary:
		"bg-surface-2 border border-border-DEFAULT text-data hover:bg-surface-3 font-mono text-xs uppercase tracking-wider disabled:opacity-50",
	ghost:
		"text-muted hover:text-data hover:bg-surface-2 font-mono text-xs tracking-wider disabled:opacity-50",
	danger:
		"bg-crimson-bg border border-crimson/30 text-crimson hover:bg-crimson/20 font-mono text-xs uppercase tracking-wider disabled:opacity-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5",
	md: "px-4 py-2",
	lg: "px-5 py-2.5",
};

export function Button({
	children,
	variant = "secondary",
	size = "md",
	onClick,
	href,
	disabled,
	type = "button",
	className,
}: ButtonProps) {
	const classes = cn(
		"inline-flex items-center justify-center gap-2 rounded-sm transition-colors cursor-pointer",
		VARIANT_CLASSES[variant],
		SIZE_CLASSES[size],
		disabled && "pointer-events-none opacity-50",
		className,
	);

	if (href) {
		return (
			<Link href={href} className={classes} aria-disabled={disabled}>
				{children}
			</Link>
		);
	}

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={classes}
		>
			{children}
		</button>
	);
}
