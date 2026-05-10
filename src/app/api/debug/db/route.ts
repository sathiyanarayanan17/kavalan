export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface TableSnapshot {
	name: string;
	count: number;
	latest: unknown[];
	columns: string[];
}

const TABLES = [
	"cases",
	"evidence",
	"autopsy_reports",
	"tod_estimates",
	"digital_evidence",
	"case_activities",
	"ai_calls",
];

export async function GET() {
	try {
		const dbFile = (
			db.prepare("PRAGMA database_list").all() as Array<{ file: string }>
		)[0]?.file;

		const snapshots: TableSnapshot[] = [];
		for (const table of TABLES) {
			try {
				const exists = db
					.prepare(
						"SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
					)
					.get(table);
				if (!exists) continue;

				const count = (
					db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as {
						c: number;
					}
				).c;

				// Infer ORDER BY column for "latest N rows"
				const info = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
					name: string;
				}>;
				const columns = info.map((c) => c.name);
				const orderCol =
					columns.find((c) =>
						[
							"createdAt",
							"analyzedAt",
							"estimatedAt",
							"collectedAt",
							"timestamp",
							"dateCreated",
						].includes(c),
					) ?? columns[0];

				const latest = db
					.prepare(`SELECT * FROM ${table} ORDER BY ${orderCol} DESC LIMIT 20`)
					.all();

				snapshots.push({ name: table, count, latest, columns });
			} catch (e) {
				snapshots.push({
					name: table,
					count: -1,
					latest: [{ error: String(e) }],
					columns: [],
				});
			}
		}

		return NextResponse.json({
			dbFile,
			serverNow: new Date().toISOString(),
			nodeVersion: process.version,
			platform: process.platform,
			tables: snapshots,
		});
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
