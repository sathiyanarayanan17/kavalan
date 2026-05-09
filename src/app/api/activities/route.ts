export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
	try {
		const activities = db
			.prepare("SELECT * FROM case_activities ORDER BY createdAt DESC LIMIT 50")
			.all();
		return NextResponse.json(activities);
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
