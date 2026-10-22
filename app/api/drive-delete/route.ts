import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleDriveAccessToken } from "@/lib/google-drive-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const driveFileId = body?.driveFileId as string | undefined;

    if (!driveFileId) {
      return NextResponse.json({ error: "Missing driveFileId" }, { status: 400 });
    }

    const accessToken = await getGoogleDriveAccessToken();
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });
    await drive.files.delete({ fileId: driveFileId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Drive delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
