import { NextResponse, type NextRequest } from "next/server";
import { answer } from "@/lib/assistant";

export const dynamic = "force-dynamic";

// Small in-memory limiter: enough to stop a stuck finger, not a botnet.
const hits = new Map<string, { n: number; until: number }>();
const LIMITED = (ip: string) => {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.until) {
    hits.set(ip, { n: 1, until: now + 60_000 });
    return false;
  }
  h.n++;
  return h.n > 20;
};

export async function POST(request: NextRequest) {
  // Same-origin only, so the key behind this route is not an open proxy.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (LIMITED(ip)) return NextResponse.json({ error: "Too many messages. Wait a minute or use WhatsApp." }, { status: 429 });

  let message = "";
  let lang: "en" | "fr" | "es" | "tw" | undefined;
  try {
    const body = await request.json();
    message = String(body?.message ?? "").trim().slice(0, 500);
    lang = ["en", "fr", "es", "tw"].includes(body?.lang) ? body.lang : undefined;
  } catch {
    // Bad body: fall through to the empty check.
  }
  if (!message) return NextResponse.json({ error: "Type a question first." }, { status: 400 });

  return NextResponse.json(await answer(message, lang));
}
