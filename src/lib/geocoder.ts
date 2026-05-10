/**
 * OpenStreetMap Nominatim geocoder. Free, no API key.
 * Policy: <=1 req/sec, meaningful User-Agent, honour caching.
 * Docs: https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const UA = "Kavalan/1.0 (hackathon demo; contact: dev@kavalan.local)";

export interface GeocodeHit {
	lat: number;
	lng: number;
	displayName: string;
}

export async function geocode(
	query: string,
	opts: { timeoutMs?: number } = {},
): Promise<GeocodeHit | null> {
	if (!query || query.trim().length < 3) return null;

	const params = new URLSearchParams({
		q: query,
		format: "json",
		limit: "1",
		addressdetails: "0",
	});

	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		opts.timeoutMs ?? 6000,
	);

	try {
		const res = await fetch(`${NOMINATIM_URL}?${params}`, {
			headers: { "User-Agent": UA, "Accept-Language": "en" },
			signal: controller.signal,
		});
		if (!res.ok) return null;
		const hits = (await res.json()) as Array<{
			lat: string;
			lon: string;
			display_name: string;
		}>;
		if (!hits.length) return null;
		const lat = parseFloat(hits[0].lat);
		const lng = parseFloat(hits[0].lon);
		if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
		return { lat, lng, displayName: hits[0].display_name };
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

export function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}
