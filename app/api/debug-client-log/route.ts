import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    await fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9e3b5b",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Intentionally silent in debug relay path.
  }

  return NextResponse.json({ ok: true });
}
