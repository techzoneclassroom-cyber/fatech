import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Same small limiter as the assistant route: a few taps per answer, not a botnet.
const hits = new Map<string, { n: number; until: number }>();
const LIMITED = (ip: string) => {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.until) {
    hits.set(ip, { n: 1, until: now + 60_000 });
    return false;
  }
  h.n++;
  return h.n > 40;
};

// Google TTS has no CORS and rejects browser referers, so the voice is fetched here.
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (LIMITED(ip)) return NextResponse.json({ error: "Too many plays. Wait a minute." }, { status: 429 });

  const lang = request.nextUrl.searchParams.get("lang") ?? "en";
  const text = (request.nextUrl.searchParams.get("text") ?? "").trim().slice(0, 200);
  if (!["en", "fr", "es"].includes(lang) || !text) {
    return NextResponse.json({ error: "Voice unavailable." }, { status: 400 });
  }

  const res = await fetch(
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&ttsspeed=0.9&tl=${lang}&q=${encodeURIComponent(text)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json({ error: "Voice unavailable." }, { status: 502 });

  return new NextResponse(await res.arrayBuffer(), {
    headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=86400" },
  });
}
