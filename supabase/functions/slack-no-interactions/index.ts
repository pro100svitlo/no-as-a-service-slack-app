import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import {
  verifySlackRequest,
  fetchMultipleReasons,
  buildSlackResponseWithMultipleReasons,
  ACTION_SELECT_REASON_1,
  ACTION_SELECT_REASON_2,
  ACTION_SELECT_REASON_3,
  ACTION_POST_MESSAGE,
  ACTION_REGENERATE_MESSAGE,
  ACTION_CANCEL_MESSAGE,
} from "../_shared/slack-utils.ts";

// ==============================
// Types
// ==============================
interface SlackInteraction {
  type: string;
  user: { id: string; username: string; name: string };
  response_url: string;
  actions: Array<{
    action_id: string;
    value?: string;
  }>;
  channel: { id: string; name: string };
  message: {
    ts: string;
  };
}

// ==============================
// Main handler
// ==============================
serve(async (req) => {
  console.log("Received request:", req.method);

  // Allow GET for testing
  if (req.method === "GET") {
    return new Response("slack-no-interactions function is running", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  console.log("Raw body received:", rawBody.substring(0, 200));

  // Skip signature verification if no Slack headers present (for local testing)
  const hasSlackHeaders = req.headers.get("X-Slack-Request-Timestamp") && 
                          req.headers.get("X-Slack-Signature");
  
  if (hasSlackHeaders) {
    const isValid = await verifySlackRequest(req, rawBody);
    if (!isValid) {
      console.error("Invalid Slack signature");
      return new Response("Invalid Slack signature", { status: 401 });
    }
  }

  try {
    // Slack sends interactions as x-www-form-urlencoded with a "payload" field
    const params = new URLSearchParams(rawBody);
    const payloadStr = params.get("payload");

    if (!payloadStr) {
      console.error("Missing payload in request");
      return new Response("Missing payload", { status: 400 });
    }

    const payload: SlackInteraction = JSON.parse(payloadStr);
    console.log("Parsed payload type:", payload.type);
    console.log("Action:", payload.actions?.[0]?.action_id);
    
    const action = payload.actions?.[0];

    if (!action) {
      console.error("No action found in payload");
      return new Response("No action found", { status: 400 });
    }

    console.log(`Handling action: ${action.action_id}`);

    // Handle different button actions
    switch (action.action_id) {
      case ACTION_SELECT_REASON_1:
      case ACTION_SELECT_REASON_2:
      case ACTION_SELECT_REASON_3:
      case ACTION_POST_MESSAGE: {
        // Post the reason publicly to the channel
        const reason = action.value || "No reason provided";
        console.log("Posting message:", reason);

        // First, acknowledge and delete the ephemeral message immediately
        // Then post to channel using response_url
        
        // Send async request to response_url to post to channel
        fetch(payload.response_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            response_type: "in_channel",
            text: reason,
          }),
        }).catch(err => console.error("Failed to post to channel:", err));

        // Return immediately to delete the original ephemeral message
        return new Response(
          JSON.stringify({
            delete_original: true,
          }),
          { 
            headers: { "Content-Type": "application/json" },
            status: 200
          }
        );
      }

      case ACTION_REGENERATE_MESSAGE: {
        // Fetch a new reason and update the message
        console.log("Regenerating message");
        
        // Fetch new reasons and post asynchronously
        (async () => {
          try {
            const newReasons = await fetchMultipleReasons(3);
            console.log("New reasons fetched:", newReasons);
            const slackResponse = buildSlackResponseWithMultipleReasons(newReasons);

            await fetch(payload.response_url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...slackResponse,
                replace_original: true,
              }),
            });
            console.log("Message regenerated successfully");
          } catch (err) {
            console.error("Failed to regenerate:", err);
          }
        })();

        // Return immediately to acknowledge the interaction
        return new Response("", { status: 200 });
      }

      case ACTION_CANCEL_MESSAGE: {
        // Delete the ephemeral message
        console.log("Canceling message - deleting original");
        
        // Send delete request to response_url
        fetch(payload.response_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delete_original: true,
          }),
        }).catch(err => console.error("Failed to delete message:", err));

        // Return immediately to acknowledge
        return new Response("", { status: 200 });
      }

      default:
        console.error("Unknown action:", action.action_id);
        return new Response("Unknown action", { status: 400 });
    }
  } catch (err) {
    console.error("Error handling interaction:", err);

    return new Response(
      JSON.stringify({
        response_type: "ephemeral",
        text: "Something went wrong. Please try again.",
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
