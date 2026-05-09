export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { correlateDigitalEvidence } from "@/lib/ai-engine";
import type { DigitalEvidence } from "@/types";

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
				timestamp: e.timestamp,
				location: e.location,
				subject: e.subject,
				description: e.description,
			}));
		}

		const result = await correlateDigitalEvidence({ events });

		return NextResponse.json({ caseId, eventCount: events.length, ...result });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
