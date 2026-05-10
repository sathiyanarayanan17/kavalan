export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { geocode } from "@/lib/geocoder";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const risk = searchParams.get("risk");

		let query = "SELECT * FROM cases";
		const conditions: string[] = [];
		const params: unknown[] = [];

		if (status) {
			conditions.push("status = ?");
			params.push(status.toUpperCase());
		}
		if (risk) {
			conditions.push("riskLevel = ?");
			params.push(risk.toUpperCase());
		}
		if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
		query += " ORDER BY dateCreated DESC";

		const cases = db.prepare(query).all(...params);
		return NextResponse.json(cases);
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const id = `case-${randomUUID().slice(0, 8)}`;
		const year = new Date().getFullYear();

		const existing = db
			.prepare(
				"SELECT caseRef FROM cases WHERE caseRef LIKE ? ORDER BY caseRef DESC LIMIT 1",
			)
			.get(`CASE-${year}-%`) as { caseRef: string } | undefined;

		let sequence = 1;
		if (existing) {
			const parts = existing.caseRef.split("-");
			sequence = parseInt(parts[parts.length - 1], 10) + 1;
		}
		const caseRef = `CASE-${year}-${String(sequence).padStart(4, "0")}`;
		const dateCreated = new Date().toISOString();

		const newCase = {
			id: id,
			caseRef: caseRef,
			title: body.title ?? "Untitled Case",
			description: body.description ?? "",
			status: body.status ?? "OPEN",
			riskLevel: body.riskLevel ?? "LOW",
			riskScore: body.riskScore ?? 0,
			location: body.location ?? "",
			dateCreated: dateCreated,
			dateOfIncident: body.dateOfIncident ?? dateCreated,
			assignedAgent: body.assignedAgent ?? "",
			suspectCount: body.suspectCount ?? 0,
			evidenceCount: 0,
			victimName: body.victimName ?? "",
			tags: Array.isArray(body.tags)
				? JSON.stringify(body.tags)
				: (body.tags ?? "[]"),
		};

		db.prepare(`
      INSERT INTO cases
        (id,caseRef,title,description,status,riskLevel,riskScore,location,
         dateCreated,dateOfIncident,assignedAgent,suspectCount,evidenceCount,victimName,tags)
      VALUES
        ($id,$caseRef,$title,$description,$status,$riskLevel,$riskScore,$location,
         $dateCreated,$dateOfIncident,$assignedAgent,$suspectCount,$evidenceCount,$victimName,$tags)
    `).run(newCase);

		// Auto-geocode the case location so it appears on the Intel Map
		// immediately. Failures are non-fatal — user can retry from /map.
		if (newCase.location && newCase.location.trim().length >= 3) {
			try {
				const hit = await geocode(newCase.location);
				if (hit) {
					db.prepare(
						"UPDATE cases SET lat = $lat, lng = $lng, geocodedAt = $geocodedAt WHERE id = $id",
					).run({
						id,
						lat: hit.lat,
						lng: hit.lng,
						geocodedAt: new Date().toISOString(),
					});
				}
			} catch (err) {
				console.warn(
					"auto-geocode failed for",
					newCase.location,
					(err as Error).message,
				);
			}
		}

		const created = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
