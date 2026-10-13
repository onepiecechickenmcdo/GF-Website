import { NextResponse } from "next/server";
import { LETTER_PUBLISH_AT, LETTER_EXPIRES_AT } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const publish = new Date(LETTER_PUBLISH_AT);
  const expires = new Date(LETTER_EXPIRES_AT);

  const isActive = now >= publish && now < expires;
  const isArchived = now >= expires;

  return NextResponse.json({ isActive, isArchived });
}
