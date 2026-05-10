export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server";

function parseCsv(csv: string): string[][] {
	const rows: string[][] = [];
	let field = "";
	let row: string[] = [];
	let inQuotes = false;
	for (let i = 0; i < csv.length; i++) {
		const c = csv[i];
		if (inQuotes) {
			if (c === '"' && csv[i + 1] === '"') {
				field += '"';
				i++;
			} else if (c === '"') {
				inQuotes = false;
			} else {
				field += c;
			}
		} else if (c === '"') {
			inQuotes = true;
		} else if (c === ",") {
			row.push(field);
			field = "";
		} else if (c === "\n" || c === "\r") {
			if (c === "\r" && csv[i + 1] === "\n") i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += c;
		}
	}
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows
		.map((r) => r.map((c) => c.trim()))
		.filter((r) => r.some((c) => c.length > 0));
}

/**
 * Convert the parsed CSV rows into a readable autopsy narrative that our
 * analyzer expects. Supports two common layouts:
 *
 *   1. Two-column key/value (e.g. "Cause of Death, Blunt force trauma")
 *   2. Multi-column tabular (header row + data rows). Each data row is
 *      rendered as "label1: value1 | label2: value2 ..." with known
 *      header labels like "injury", "location", "description" consolidated
 *      into numbered injury lists where possible.
 */
function rowsToReport(rows: string[][]): string {
	if (rows.length === 0) return "";

	// Detect shape
	const widths = rows.map((r) => r.length);
	const maxW = Math.max(...widths);
	const looksKV = rows.every((r) => r.length === 2);

	if (looksKV) {
		const lines: string[] = ["AUTOPSY REPORT (ingested from CSV)", ""];
		for (const [k, v] of rows) {
			const key = k.trim();
			const val = v.trim();
			if (!key) continue;
			lines.push(`${key}: ${val || "—"}`);
		}
		return lines.join("\n");
	}

	// Tabular — first row = header
	const header = rows[0].map((h) => h.toLowerCase());
	const hasInjuryCols =
		header.some((h) => /injur|wound|finding/.test(h)) &&
		header.some((h) => /location|site|region|anatomy/.test(h));

	const lines: string[] = [
		"AUTOPSY REPORT (ingested from CSV)",
		"",
		`Columns: ${rows[0].join(", ")}`,
		"",
	];

	if (hasInjuryCols) {
		lines.push("INJURIES:");
		rows.slice(1).forEach((r, i) => {
			const cells = header.map((h, idx) => ({
				h,
				v: (r[idx] ?? "").trim(),
			}));
			const injury = cells.find((c) => /injur|wound|finding|type/.test(c.h))?.v ??
				"Injury";
			const location = cells.find((c) =>
				/location|site|region|anatomy/.test(c.h),
			)?.v;
			const size = cells.find((c) => /size|length|depth|measure/.test(c.h))?.v;
			const note = cells.find((c) => /note|desc|comment/.test(c.h))?.v;
			let line = `${i + 1}. ${injury}`;
			if (location) line += ` on ${location}`;
			if (size) line += ` (${size})`;
			if (note) line += ` — ${note}`;
			lines.push(line);
		});
	} else {
		rows.slice(1).forEach((r) => {
			const parts: string[] = [];
			header.forEach((h, idx) => {
				const v = (r[idx] ?? "").trim();
				if (v) parts.push(`${h}: ${v}`);
			});
			if (parts.length) lines.push(parts.join(" | "));
		});
	}

	void maxW;
	return lines.join("\n");
}

export async function POST(request: NextRequest) {
	try {
		const contentType = request.headers.get("content-type") ?? "";
		let csvText = "";

		if (contentType.startsWith("multipart/form-data")) {
			const form = await request.formData();
			const file = form.get("csv");
			if (file instanceof File) {
				csvText = await file.text();
			} else {
				csvText = String(form.get("csvText") ?? "");
			}
		} else {
			const body = await request.json();
			csvText = String(body?.csv ?? body?.csvText ?? "");
		}

		csvText = csvText.trim();
		if (!csvText)
			return NextResponse.json(
				{ error: "No CSV content provided." },
				{ status: 400 },
			);

		const rows = parseCsv(csvText);
		if (rows.length === 0)
			return NextResponse.json(
				{ error: "CSV contained no parseable rows." },
				{ status: 400 },
			);

		const text = rowsToReport(rows);
		return NextResponse.json({ text, rowsParsed: rows.length });
	} catch (error) {
		return NextResponse.json({ error: String(error) }, { status: 500 });
	}
}
