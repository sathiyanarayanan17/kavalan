export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";
import { callClaudeVision } from "@/lib/ai-engine";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
	try {
		const form = await request.formData();
		const file = form.get("image");
		if (!(file instanceof File))
			return NextResponse.json(
				{ error: "image field is required (multipart/form-data)" },
				{ status: 400 },
			);
		if (!ALLOWED.has(file.type))
			return NextResponse.json(
				{
					error: `Unsupported image type ${file.type}. Allowed: ${Array.from(ALLOWED).join(", ")}`,
				},
				{ status: 415 },
			);
		if (file.size > MAX_BYTES)
			return NextResponse.json(
				{
					error: `Image too large (${Math.round(file.size / 1024)} KB, max 8 MB)`,
				},
				{ status: 413 },
			);

		const bytes = new Uint8Array(await file.arrayBuffer());
		const base64 = Buffer.from(bytes).toString("base64");

		const systemPrompt = `You are a forensic document transcription assistant.
You receive photographs or scans of autopsy report pages and transcribe the content
verbatim. Do not summarize, interpret, or add commentary. Preserve section headings,
numbered injury lists, paragraph breaks, measurements, anatomical terms, and any
toxicology tables as they appear in the source. If a region is partially illegible,
write [illegible] and continue. Output only the transcribed text as plain text —
no JSON, no markdown, no preamble, no notes.`;

		const userPrompt = `Transcribe this autopsy report page verbatim.
Preserve the structure:
- Section headings (CIRCUMSTANCES, EXTERNAL EXAMINATION, INJURIES, TOXICOLOGY, OPINION, etc.)
- Numbered or bulleted lists of injuries with anatomical locations and measurements
- Body temperature, rigor stage, livor findings exactly as written
- Cause of death and manner of death statements
- Any signature block or prosector identification if visible

Output the transcription as plain text only.`;

		const text = await callClaudeVision(
			systemPrompt,
			userPrompt,
			[{ mediaType: file.type, base64 }],
			2048,
			"autopsy_image_transcription",
		);

		const cleaned = (text ?? "").trim();
		if (!cleaned)
			return NextResponse.json(
				{
					error:
						"No text could be extracted from the image. Check image clarity and resolution.",
				},
				{ status: 422 },
			);

		return NextResponse.json({
			text: cleaned,
			bytes: file.size,
			mimeType: file.type,
		});
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
