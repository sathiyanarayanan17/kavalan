export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface DraftShape {
	rawReport?: string;
	bodyTemperature?: string;
	ambientTemperature?: string;
	rigorMortisStage?: string;
	livorMortisState?: string;
	savedAt?: string;
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const row = db
			.prepare("SELECT autopsyDraft FROM cases WHERE id = ?")
			.get(id) as { autopsyDraft?: string } | undefined;
		if (!row)
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		if (!row.autopsyDraft) return NextResponse.json({ draft: null });

		try {
			return NextResponse.json({ draft: JSON.parse(row.autopsyDraft) });
		} catch {
			return NextResponse.json({ draft: null });
		}
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		if (!db.prepare("SELECT id FROM cases WHERE id = ?").get(id))
			return NextResponse.json({ error: "Case not found" }, { status: 404 });

		const body = (await request.json()) as DraftShape;
		const draft: DraftShape = {
			rawReport: String(body.rawReport ?? "").slice(0, 50_000),
			bodyTemperature: String(body.bodyTemperature ?? "").slice(0, 20),
			ambientTemperature: String(body.ambientTemperature ?? "").slice(0, 20),
			rigorMortisStage: String(body.rigorMortisStage ?? "").slice(0, 10),
			livorMortisState: String(body.livorMortisState ?? "").slice(0, 40),
			savedAt: new Date().toISOString(),
		};

		db.prepare("UPDATE cases SET autopsyDraft = $draft WHERE id = $id").run({
			id,
			draft: JSON.stringify(draft),
		});

		return NextResponse.json({ saved: true, savedAt: draft.savedAt });
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
		db.prepare("UPDATE cases SET autopsyDraft = '' WHERE id = ?").run(id);
		return NextResponse.json({ cleared: true });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
