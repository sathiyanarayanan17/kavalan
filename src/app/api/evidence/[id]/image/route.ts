export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

const IMAGE_DIR = path.join(process.cwd(), "data", "evidence_images");

const MIME_BY_EXT: Record<string, string> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
};

export async function GET(
	_request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const row = db
			.prepare("SELECT imagePath FROM evidence WHERE id = ?")
			.get(id) as { imagePath?: string } | undefined;
		if (!row || !row.imagePath)
			return NextResponse.json(
				{ error: "No image attached" },
				{ status: 404 },
			);

		// Safety: imagePath must be a plain filename, no slashes or traversal.
		if (row.imagePath.includes("/") || row.imagePath.includes("\\"))
			return NextResponse.json({ error: "Invalid path" }, { status: 400 });

		const full = path.join(IMAGE_DIR, row.imagePath);
		if (!fs.existsSync(full))
			return NextResponse.json({ error: "Image file missing" }, { status: 404 });

		const buf = fs.readFileSync(full);
		const ext = path.extname(row.imagePath).toLowerCase();
		const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";

		return new NextResponse(buf, {
			status: 200,
			headers: {
				"Content-Type": mime,
				"Cache-Control": "private, max-age=300",
			},
		});
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
