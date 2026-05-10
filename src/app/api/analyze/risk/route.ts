export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateRiskScore } from "@/lib/ai-engine";
import type { Case } from "@/types";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { caseId } = body;
		if (!caseId)
			return NextResponse.json(
				{ error: "caseId is required" },
				{ status: 400 },
			);

		const caseRow = db
			.prepare("SELECT * FROM cases WHERE id = ?")
			.get(caseId) as Case | undefined;
		if (!caseRow)
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		const autopsyRow = db
			.prepare(
				"SELECT mannerOfDeath FROM autopsy_reports WHERE caseId = ? ORDER BY analyzedAt DESC LIMIT 1",
			)
			.get(caseId) as { mannerOfDeath: string } | undefined;
		const hasTodEstimate = !!db
			.prepare("SELECT id FROM tod_estimates WHERE caseId = ? LIMIT 1")
			.get(caseId);
		const digitalRows = db
			.prepare("SELECT anomalyScore FROM digital_evidence WHERE caseId = ?")
			.all(caseId) as { anomalyScore: number }[];
		const digitalAnomalyCount = digitalRows.filter(
			(d) => d.anomalyScore > 50,
		).length;

		const digitalTimestamps = (
			db
				.prepare(
					"SELECT timestamp FROM digital_evidence WHERE caseId = ? ORDER BY timestamp ASC",
				)
				.all(caseId) as { timestamp: string }[]
		).map((r) => new Date(r.timestamp).getTime());
		let openTimelinGaps = 0;
		for (let i = 1; i < digitalTimestamps.length; i++) {
			if ((digitalTimestamps[i] - digitalTimestamps[i - 1]) / 3600000 > 2)
				openTimelinGaps++;
		}

		const result = calculateRiskScore({
			caseId,
			evidenceCount: caseRow.evidenceCount,
			suspectCount: caseRow.suspectCount,
			digitalAnomalyCount,
			hasAutopsy: !!autopsyRow,
			hasTodEstimate,
			mannerOfDeath: autopsyRow?.mannerOfDeath,
			openTimelinGaps,
			caseAgeHours:
				(Date.now() - new Date(caseRow.dateCreated).getTime()) / 3600000,
		});

		db.prepare(
			"UPDATE cases SET riskScore = $riskScore, riskLevel = $riskLevel WHERE id = $id",
		).run({
			riskScore: result.overall,
			riskLevel: result.tier,
			id: caseId,
		});

		return NextResponse.json({ caseId, ...result });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
