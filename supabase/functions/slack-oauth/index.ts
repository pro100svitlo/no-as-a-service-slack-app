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
  <title>Installation Failed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
           max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
    .error { color: #e01e5a; font-size: 18px; margin: 20px 0; }
    .details { color: #616061; font-size: 14px; }
  </style>
</head>
<body>
  <h1>❌ Installation Failed</h1>
  <div class="error">Error: ${error}</div>
  <div class="details">${errorDescription}</div>
  <p><a href="/">Try again</a></p>
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
  <title>Missing Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
           max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
  </style>
</head>
<body>
  <h1>⚠️ Missing Authorization Code</h1>
  <p>No authorization code was provided in the OAuth callback.</p>
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

    // Success response
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>Installation Successful</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
           max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
    .success { color: #2eb886; font-size: 24px; margin: 20px 0; }
    .team { font-weight: bold; color: #1d1c1d; }
    .next-steps { text-align: left; background: #f8f8f8; padding: 20px; 
                   border-radius: 8px; margin: 30px 0; }
    .next-steps h3 { margin-top: 0; }
    .next-steps li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="success">✅ Installation Successful!</div>
  <p>No-as-a-Service has been installed to <span class="team">${oauthResponse.team?.name || "your workspace"}</span></p>
  
  <div class="next-steps">
    <h3>Next Steps:</h3>
    <ol>
      <li>Go to any Slack channel</li>
      <li>Type <code>/no</code> and press Enter</li>
      <li>Get creative "no" responses!</li>
    </ol>
  </div>

  <p><small>You can close this window and return to Slack.</small></p>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );

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
