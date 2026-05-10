export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { correlateDigitalEvidence } from "@/lib/ai-engine";
import type { DigitalEvidence } from "@/types";

type ClaudePattern = {
	pattern?: string;
	label?: string;
	confidence?: number;
	subjects?: string[];
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { caseId, events: inputEvents } = body;

		if (!caseId) {
			return NextResponse.json(
				{ error: "caseId is required" },
				{ status: 400 },
			);
		}

		const caseRow = db.prepare("SELECT id FROM cases WHERE id = ?").get(caseId);
		if (!caseRow) {
			return NextResponse.json({ error: "Case not found" }, { status: 404 });
		}

		let events = inputEvents;

		// If no events provided, fetch from db
		if (!events || events.length === 0) {
			const dbEvents = db
				.prepare(
					"SELECT * FROM digital_evidence WHERE caseId = ? ORDER BY timestamp ASC",
				)
				.all(caseId) as unknown as DigitalEvidence[];

			events = dbEvents.map((e) => ({
				sourceType: e.sourceType,
				sourceName: e.sourceName,
				timestamp: e.timestamp,
				location: e.location,
				subject: e.subject,
				description: e.description,
				anomalyScore: e.anomalyScore,
			}));
		}

		if (events.length === 0) {
			return NextResponse.json({
				caseId,
				eventCount: 0,
				anomalies: [],
				patterns: [],
				digitalRisk: 0,
				timeline: [],
				summary:
					"No digital evidence in this case. Add records (CCTV, mobile, financial, etc.) on the Digital Evidence tab, then rerun correlation.",
			});
		}

		const result = await correlateDigitalEvidence({ events });

		// Normalise shape to match what the Digital panel UI consumes.
		const patterns = ((
			result as unknown as { patterns?: ClaudePattern[] }
		).patterns ?? []).map((p) => ({
			label: p.label ?? p.pattern ?? "Pattern",
			confidence:
				typeof p.confidence === "number"
					? Math.max(0, Math.min(100, Math.round(p.confidence)))
					: 50,
			subjects: p.subjects,
		}));

		return NextResponse.json({
			caseId,
			eventCount: events.length,
			anomalies: result.anomalies ?? [],
			patterns,
			digitalRisk: Math.max(
				0,
				Math.min(100, Math.round(result.riskContribution ?? 0)),
			),
			timeline: result.timeline ?? [],
			summary:
				(result as unknown as { summary?: string }).summary ??
				(result.anomalies && result.anomalies.length > 0
					? `${result.anomalies.length} anomaly event${
							result.anomalies.length === 1 ? "" : "s"
						} detected across ${events.length} digital record${events.length === 1 ? "" : "s"}.`
					: `Reviewed ${events.length} digital record${events.length === 1 ? "" : "s"}. No significant anomalies flagged.`),
		});
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
