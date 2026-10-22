import { NextResponse } from "next/server";
import { getGoogleDriveAccessToken } from "@/lib/google-drive-auth";

export async function GET() {
  try {
    await getGoogleDriveAccessToken();
    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Google Drive unavailable:", error);
    return NextResponse.json({ available: false });
  }
}
