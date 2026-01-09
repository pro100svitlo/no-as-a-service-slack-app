import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import {
  verifySlackRequest,
  fetchNoReason,
  buildSlackResponse,
} from "../_shared/slack-utils.ts";

// ==============================
// Main handler
// ==============================
serve(async (req) => {
  // Allow GET for testing
  if (req.method === "GET") {
    return new Response("slack-no function is running. Use POST for actual requests.", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Not allowed", { status: 405 });
  }

  const rawBody = await req.text();

  // Skip signature verification if no Slack headers present (for local testing)
  const hasSlackHeaders = req.headers.get("X-Slack-Request-Timestamp") && 
                          req.headers.get("X-Slack-Signature");
  
  if (hasSlackHeaders) {
    const isValid = await verifySlackRequest(req, rawBody);
    if (!isValid) {
      return new Response("Invalid Slack signature", { status: 401 });
    }
  }

  try {
    // Slack sends slash command body as x-www-form-urlencoded
    const params = new URLSearchParams(rawBody);
    const command = params.get("command");

    if (command !== "/no") {
      return new Response("Unknown command", { status: 400 });
    }

    const reason = await fetchNoReason();
    const slackResponse = buildSlackResponse(reason);

    return new Response(JSON.stringify(slackResponse), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        response_type: "ephemeral",
        text: "Something went wrong. Try again later.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});
