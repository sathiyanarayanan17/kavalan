export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db, seedIfEmpty } from "@/lib/db";

export async function POST(_request: NextRequest) {
	try {
		if (process.env.NODE_ENV === "production") {
			return NextResponse.json(
				{ error: "Seed endpoint disabled in production" },
				{ status: 403 },
			);
		}

		// Wipe and re-seed all tables
		db.exec(`
      DELETE FROM case_activities;
      DELETE FROM digital_evidence;
      DELETE FROM tod_estimates;
      DELETE FROM autopsy_reports;
      DELETE FROM evidence;
      DELETE FROM cases;
    `);

		seedIfEmpty();

		const stats = {
			cases: (
				db.prepare("SELECT COUNT(*) as count FROM cases").get() as {
					count: number;
				}
			).count,
			evidence: (
				db.prepare("SELECT COUNT(*) as count FROM evidence").get() as {
					count: number;
				}
			).count,
			autopsyReports: (
				db.prepare("SELECT COUNT(*) as count FROM autopsy_reports").get() as {
					count: number;
				}
			).count,
			todEstimates: (
				db.prepare("SELECT COUNT(*) as count FROM tod_estimates").get() as {
					count: number;
				}
			).count,
			digitalEvidence: (
				db.prepare("SELECT COUNT(*) as count FROM digital_evidence").get() as {
					count: number;
				}
			).count,
			activities: (
				db.prepare("SELECT COUNT(*) as count FROM case_activities").get() as {
					count: number;
				}
			).count,
		};

		return NextResponse.json({ success: true, seeded: stats });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}

export async function GET(_request: NextRequest) {
	try {
		const stats = {
			cases: (
				db.prepare("SELECT COUNT(*) as count FROM cases").get() as {
					count: number;
				}
			).count,
			evidence: (
				db.prepare("SELECT COUNT(*) as count FROM evidence").get() as {
					count: number;
				}
			).count,
			autopsyReports: (
				db.prepare("SELECT COUNT(*) as count FROM autopsy_reports").get() as {
					count: number;
				}
			).count,
			todEstimates: (
				db.prepare("SELECT COUNT(*) as count FROM tod_estimates").get() as {
					count: number;
				}
			).count,
			digitalEvidence: (
				db.prepare("SELECT COUNT(*) as count FROM digital_evidence").get() as {
					count: number;
				}
			).count,
			activities: (
				db.prepare("SELECT COUNT(*) as count FROM case_activities").get() as {
					count: number;
				}
			).count,
		};

		return NextResponse.json(stats);
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
