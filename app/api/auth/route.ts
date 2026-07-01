import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { pin } = body as { pin?: string };

  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  if (pin === adminPin) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
