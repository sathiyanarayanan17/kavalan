import type { RiskLevel } from "@/types";
import { Badge } from "@/components/ui/Badge";

type BadgeVariant = "crimson" | "amber" | "sky" | "sage";

const LEVEL_MAP: Record<RiskLevel, { variant: BadgeVariant; label: string }> = {
	CRITICAL: { variant: "crimson", label: "CRITICAL" },
	HIGH: { variant: "amber", label: "HIGH" },
	MEDIUM: { variant: "sky", label: "MEDIUM" },
	LOW: { variant: "sage", label: "LOW" },
};

interface RiskBadgeProps {
	level: RiskLevel;
	score?: number;
}

export function RiskBadge({ level, score }: RiskBadgeProps) {
	const { variant, label } = LEVEL_MAP[level];
	return (
		<Badge variant={variant}>
			{score !== undefined ? `${label} · ${score}` : label}
		</Badge>
	);
}
