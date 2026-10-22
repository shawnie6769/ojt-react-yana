export async function getGoogleDriveAccessToken(): Promise<string> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials in environment variables");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorCode = "";

    try {
      errorCode = (JSON.parse(errorText) as { error?: string }).error || "";
    } catch {
      // Keep the original response available for unexpected token errors.
    }

    if (errorCode === "invalid_grant") {
      throw new Error(
        "Google Drive authorization has expired or been revoked. Generate a new refresh token and update GOOGLE_REFRESH_TOKEN."
      );
    }

    throw new Error(`Failed to refresh token: ${errorText}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google OAuth response did not include an access token");
  }

  return data.access_token;
}
