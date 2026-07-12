import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Called by the API (f1-api-ws) right after PUT /config/discord-link, so a
// rotated Discord link shows up immediately instead of waiting up to 10
// days for the Next.js data cache to expire on its own.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const tag = body?.tag;
  const secret = body?.secret;

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, error: "Invalid secret" }, { status: 401 });
  }

  if (typeof tag !== "string" || !tag) {
    return NextResponse.json({ success: false, error: "tag is required" }, { status: 400 });
  }

  revalidateTag(tag);
  return NextResponse.json({ success: true, revalidated: true, tag });
}
