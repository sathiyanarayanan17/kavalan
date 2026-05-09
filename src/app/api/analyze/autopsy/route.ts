export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeAutopsyReport } from "@/lib/ai-engine";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			caseId,
			reportText,
			bodyTemperature,
			ambientTemperature,
			rigorMortisStage,
			livorMortisState,
		} = body;

		if (!caseId || !reportText)
			return NextResponse.json(
				{ error: "caseId and reportText are required" },
				{ status: 400 },
			);

		if (!db.prepare("SELECT id FROM cases WHERE id = ?").get(caseId))
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		const result = await analyzeAutopsyReport({
			reportText,
			bodyTemperature,
			ambientTemperature,
			rigorMortisStage,
			livorMortisState,
		});

		const id = `aut-${randomUUID().slice(0, 8)}`;
		const analyzedAt = new Date().toISOString();

		db.prepare(`
      INSERT INTO autopsy_reports
        (id,caseId,rawReport,analyzedAt,causeOfDeath,mannerOfDeath,postmortemInterval,
         injuryPattern,toxicologyFindings,woundsCount,bodyTemperature,rigorMortisStage,
         livorMortisState,confidence,analysisNotes)
      VALUES
        ($id,$caseId,$rawReport,$analyzedAt,$causeOfDeath,$mannerOfDeath,$postmortemInterval,
         $injuryPattern,$toxicologyFindings,$woundsCount,$bodyTemperature,$rigorMortisStage,
         $livorMortisState,$confidence,$analysisNotes)
    `).run({
			$id: id,
			$caseId: caseId,
			$rawReport: reportText,
			$analyzedAt: analyzedAt,
			$causeOfDeath: result.causeOfDeath,
			$mannerOfDeath: result.mannerOfDeath,
			$postmortemInterval: result.postmortemInterval,
			$injuryPattern: result.injuryPattern,
			$toxicologyFindings: result.toxicologyFindings,
			$woundsCount: result.woundsCount,
			$bodyTemperature: bodyTemperature ?? 0,
			$rigorMortisStage: rigorMortisStage ?? 0,
			$livorMortisState: livorMortisState ?? "",
			$confidence: result.confidence,
			$analysisNotes: result.analysisNotes,
		});

		db.prepare(
			`INSERT INTO case_activities (id,caseId,type,description,createdAt,agent) VALUES ($id,$caseId,$type,$description,$createdAt,$agent)`,
		).run({
			$id: `act-${randomUUID().slice(0, 8)}`,
			$caseId: caseId,
			$type: "ANALYSIS_RUN",
			$description: `Autopsy analyzed. COD: ${result.causeOfDeath}. Manner: ${result.mannerOfDeath}.`,
			$createdAt: analyzedAt,
			$agent: "KAVALAN AI Engine",
		});

		return NextResponse.json({ id, caseId, analyzedAt, ...result });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
