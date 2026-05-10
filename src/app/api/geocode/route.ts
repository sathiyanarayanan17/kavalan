export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geocode, sleep } from "@/lib/geocoder";

interface CaseRow {
	id: string;
	location: string;
	lat: number | null;
	lng: number | null;
}

/**
 * POST /api/geocode
 * Body: { force?: boolean } — if true, re-geocode even rows that already have coords.
 * Looks at every case; for each with a non-empty location and no coords (or force),
 * calls Nominatim with a 1.1s delay between requests (Nominatim's usage policy).
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		const force = body?.force === true;

		const rows = db
			.prepare("SELECT id, location, lat, lng FROM cases")
			.all() as CaseRow[];

		const candidates = rows.filter((r) => {
			if (!r.location || r.location.trim().length < 3) return false;
			if (!force && r.lat != null && r.lng != null) return false;
			return true;
		});

		const update = db.prepare(
			"UPDATE cases SET lat = $lat, lng = $lng, geocodedAt = $geocodedAt WHERE id = $id",
		);

		const results: Array<{
			id: string;
			location: string;
			status: "ok" | "not_found" | "error";
			lat?: number;
			lng?: number;
			reason?: string;
		}> = [];

		for (let i = 0; i < candidates.length; i++) {
			const row = candidates[i];
			try {
				const hit = await geocode(row.location);
				if (!hit) {
					results.push({
						id: row.id,
						location: row.location,
						status: "not_found",
					});
				} else {
					update.run({
						id: row.id,
						lat: hit.lat,
						lng: hit.lng,
						geocodedAt: new Date().toISOString(),
					});
					results.push({
						id: row.id,
						location: row.location,
						status: "ok",
						lat: hit.lat,
						lng: hit.lng,
					});
				}
			} catch (e) {
				results.push({
					id: row.id,
					location: row.location,
					status: "error",
					reason: (e as Error).message,
				});
			}
			// Rate limit — Nominatim asks for ~1 req/sec.
			if (i < candidates.length - 1) await sleep(1100);
		}

		return NextResponse.json({
			scanned: rows.length,
			attempted: candidates.length,
			results,
		});
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}

export async function GET() {
	const rows = db
		.prepare(
			"SELECT id, caseRef, title, status, riskLevel, riskScore, location, lat, lng, dateCreated, dateOfIncident, victimName FROM cases WHERE lat IS NOT NULL AND lng IS NOT NULL",
		)
		.all();
	const missing = (
		db
			.prepare(
				"SELECT COUNT(*) as n FROM cases WHERE (lat IS NULL OR lng IS NULL) AND location IS NOT NULL AND length(trim(location)) > 2",
			)
			.get() as { n: number }
	).n;
	return NextResponse.json({ cases: rows, missing });
}
