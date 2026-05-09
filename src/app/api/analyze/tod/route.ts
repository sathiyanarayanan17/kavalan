export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { estimateTod } from "@/lib/ai-engine";
import type { TodInput } from "@/lib/ai-engine";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			caseId,
			bodyTemp,
			ambientTemp,
			rigorMortisStage,
			livorMortisState,
			lastSeenAlive,
			weight,
		} = body;

		if (!caseId || bodyTemp === undefined || ambientTemp === undefined)
			return NextResponse.json(
				{ error: "caseId, bodyTemp, and ambientTemp are required" },
				{ status: 400 },
			);

		if (!db.prepare("SELECT id FROM cases WHERE id = ?").get(caseId))
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		const input: TodInput = {
			bodyTemp,
			ambientTemp,
			rigorMortisStage: rigorMortisStage ?? 1,
			livorMortisState: livorMortisState ?? "faint",
			lastSeenAlive: lastSeenAlive ?? "",
			weight: weight ?? 70,
		};

		const result = estimateTod(input);
		const id = `tod-${randomUUID().slice(0, 8)}`;
		const estimatedAt = new Date().toISOString();

		db.prepare(`
      INSERT INTO tod_estimates
        (id,caseId,estimatedAt,bodyTemp,ambientTemp,rigorMortisStage,livorMortisState,
         lastSeenAlive,estimatedTodEarliest,estimatedTodLatest,confidenceLevel,methodology,notes)
      VALUES
        ($id,$caseId,$estimatedAt,$bodyTemp,$ambientTemp,$rigorMortisStage,$livorMortisState,
         $lastSeenAlive,$estimatedTodEarliest,$estimatedTodLatest,$confidenceLevel,$methodology,$notes)
    `).run({
			$id: id,
			$caseId: caseId,
			$estimatedAt: estimatedAt,
			$bodyTemp: bodyTemp,
			$ambientTemp: ambientTemp,
			$rigorMortisStage: input.rigorMortisStage,
			$livorMortisState: input.livorMortisState,
			$lastSeenAlive: input.lastSeenAlive ?? "",
			$estimatedTodEarliest: result.estimatedTodEarliest,
			$estimatedTodLatest: result.estimatedTodLatest,
			$confidenceLevel: result.confidenceLevel,
			$methodology: result.methodology,
			$notes: result.notes,
		});

		db.prepare(
			`INSERT INTO case_activities (id,caseId,type,description,createdAt,agent) VALUES ($id,$caseId,$type,$description,$createdAt,$agent)`,
		).run({
			$id: `act-${randomUUID().slice(0, 8)}`,
			$caseId: caseId,
			$type: "ANALYSIS_RUN",
			$description: `TOD estimated. PMI: ${result.pmhHours.min}–${result.pmhHours.max}h. Confidence: ${result.confidenceLevel}%.`,
			$createdAt: estimatedAt,
			$agent: "KAVALAN AI Engine",
		});

		return NextResponse.json({ id, caseId, estimatedAt, ...result });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
