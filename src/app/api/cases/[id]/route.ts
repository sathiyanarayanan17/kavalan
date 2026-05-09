export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
	_request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const caseRow = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
		if (!caseRow)
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		const evidence = db
			.prepare(
				"SELECT * FROM evidence WHERE caseId = ? ORDER BY collectedAt DESC",
			)
			.all(id);
		const activities = db
			.prepare(
				"SELECT * FROM case_activities WHERE caseId = ? ORDER BY createdAt DESC",
			)
			.all(id);
		const autopsyReports = db
			.prepare(
				"SELECT * FROM autopsy_reports WHERE caseId = ? ORDER BY analyzedAt DESC",
			)
			.all(id);
		const digitalEvidence = db
			.prepare(
				"SELECT * FROM digital_evidence WHERE caseId = ? ORDER BY timestamp ASC",
			)
			.all(id);
		const todEstimates = db
			.prepare(
				"SELECT * FROM tod_estimates WHERE caseId = ? ORDER BY estimatedAt DESC",
			)
			.all(id);

		return NextResponse.json({
			...caseRow,
			evidence,
			activities,
			autopsyReports,
			digitalEvidence,
			todEstimates,
		});
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const body = await request.json();
		const existing = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
		if (!existing)
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		const allowed = [
			"title",
			"description",
			"status",
			"riskLevel",
			"riskScore",
			"location",
			"dateOfIncident",
			"assignedAgent",
			"suspectCount",
			"evidenceCount",
			"victimName",
			"tags",
		];
		const setClauses: string[] = [];
		const updateParams: Record<string, unknown> = { $id: id };

		for (const field of allowed) {
			if (field in body) {
				setClauses.push(`${field} = $${field}`);
				updateParams[`$${field}`] = body[field];
			}
		}
		if (setClauses.length === 0)
			return NextResponse.json({ error: "No valid fields" }, { status: 400 });

		db.prepare(`UPDATE cases SET ${setClauses.join(", ")} WHERE id = $id`).run(
			updateParams,
		);
		return NextResponse.json(
			db.prepare("SELECT * FROM cases WHERE id = ?").get(id),
		);
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		if (!db.prepare("SELECT id FROM cases WHERE id = ?").get(id))
			return NextResponse.json({ error: "Case not found" }, { status: 404 });
		db.prepare("DELETE FROM cases WHERE id = ?").run(id);
		return NextResponse.json({ success: true, id });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
