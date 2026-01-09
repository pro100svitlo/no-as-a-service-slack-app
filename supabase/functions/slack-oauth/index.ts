import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ==============================
// Types
// ==============================
interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  enterprise?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    scope?: string;
    access_token?: string;
    token_type?: string;
  };
  error?: string;
  error_description?: string;
}

interface InstallationRecord {
  team_id: string;
  team_name: string;
  bot_token: string;
  bot_user_id: string;
  scope: string;
  app_id: string;
  enterprise_id?: string;
  enterprise_name?: string;
  authed_user_id?: string;
  authed_user_token?: string;
  installed_at: string;
  updated_at: string;
}

// ==============================
// In-memory storage (fallback)
// ==============================
const tokenStore = new Map<string, InstallationRecord>();

// ==============================
// Slack OAuth token exchange
// ==============================
async function exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
  const clientId = Deno.env.get("SLACK_CLIENT_ID");
  const clientSecret = Deno.env.get("SLACK_CLIENT_SECRET");
  const redirectUri = Deno.env.get("SLACK_REDIRECT_URI");

  if (!clientId || !clientSecret) {
    throw new Error("Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET");
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (redirectUri) {
    params.append("redirect_uri", redirectUri);
  }

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }

  return await response.json();
}

// ==============================
// Store installation to database
// ==============================
async function storeInstallation(data: SlackOAuthResponse): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!data.team || !data.access_token) {
    throw new Error("Invalid OAuth response: missing team or access_token");
  }

  const record: InstallationRecord = {
    team_id: data.team.id,
    team_name: data.team.name,
    bot_token: data.access_token,
    bot_user_id: data.bot_user_id || "",
    scope: data.scope || "",
    app_id: data.app_id || "",
    enterprise_id: data.enterprise?.id,
    enterprise_name: data.enterprise?.name,
    authed_user_id: data.authed_user?.id,
    authed_user_token: data.authed_user?.access_token,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Store in-memory (always)
  tokenStore.set(data.team.id, record);
  console.log(`✓ Stored token in memory for team: ${data.team.name} (${data.team.id})`);

  // Try to store in database if available
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from("installations")
        .upsert({
          team_id: record.team_id,
          team_name: record.team_name,
          bot_token: record.bot_token,
          bot_user_id: record.bot_user_id,
          scope: record.scope,
          app_id: record.app_id,
          enterprise_id: record.enterprise_id,
          enterprise_name: record.enterprise_name,
          authed_user_id: record.authed_user_id,
          authed_user_token: record.authed_user_token,
          updated_at: record.updated_at,
        }, {
          onConflict: "team_id",
        });

      if (error) {
        console.error("Database storage error:", error);
        console.log("⚠ Falling back to in-memory storage only");
      } else {
        console.log(`✓ Stored token in database for team: ${data.team.name}`);
      }
    } catch (err) {
      console.error("Database storage exception:", err);
      console.log("⚠ Falling back to in-memory storage only");
    }
  } else {
    console.log("⚠ No database configured, using in-memory storage only");
  }
}

// ==============================
// Main handler
// ==============================
serve(async (req) => {
  console.log("Received OAuth request:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      const errorDescription = url.searchParams.get("error_description") || "Unknown error";
      console.error("OAuth error:", error, errorDescription);
      
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Installation Failed - No-as-a-Service</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 48px 32px;
      text-align: center;
    }
    .icon { font-size: 64px; margin-bottom: 24px; }
    h1 { color: #1d1c1d; font-size: 28px; margin-bottom: 16px; }
    .error { color: #e01e5a; font-size: 18px; font-weight: 600; margin: 16px 0; }
    .details {
      color: #616061;
      background: #f8f8f8;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #4a154b;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 16px;
      transition: all 0.2s ease;
    }
    .button:hover {
      background: #611f69;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">❌</div>
    <h1>Installation Failed</h1>
    <div class="error">Error: ${error}</div>
    <div class="details">${errorDescription}</div>
    <button onclick="window.close()" class="button">Close Window</button>
  </div>
</body>
</html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Validate code parameter
    if (!code) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Missing Code - No-as-a-Service</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 48px 32px;
      text-align: center;
    }
    .icon { font-size: 64px; margin-bottom: 24px; }
    h1 { color: #1d1c1d; font-size: 28px; margin-bottom: 16px; }
    p { color: #616061; line-height: 1.6; margin: 16px 0; }
    .button {
      display: inline-block;
      background: #4a154b;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 16px;
      transition: all 0.2s ease;
    }
    .button:hover { background: #611f69; transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>Missing Authorization Code</h1>
    <p>No authorization code was provided in the OAuth callback.</p>
    <button onclick="window.close()" class="button">Close Window</button>
  </div>
</body>
</html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    console.log("Exchanging code for token...");
    const oauthResponse = await exchangeCodeForToken(code);

    if (!oauthResponse.ok) {
      console.error("OAuth exchange failed:", oauthResponse.error);
      throw new Error(oauthResponse.error || "OAuth exchange failed");
    }

    console.log("Storing installation data...");
    await storeInstallation(oauthResponse);

    // Redirect to INSTALLATION_SUCCESS.md on GitHub
    const successUrl = "https://github.com/pro100svitlo/no-as-a-service-slack-app/blob/main/INSTALLATION_SUCCESS.md";
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": successUrl,
      },
    });

  } catch (err) {
    console.error("OAuth handler error:", err);

    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>Installation Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
           max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
    .error { color: #e01e5a; }
  </style>
</head>
<body>
  <h1 class="error">❌ Installation Error</h1>
  <p>Something went wrong during installation.</p>
  <p><small>${err instanceof Error ? err.message : "Unknown error"}</small></p>
  <p><a href="/">Try again</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
});
