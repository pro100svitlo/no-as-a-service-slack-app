import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==============================
// Constants
// ==============================
export const SLACK_SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET");
export const NO_API_URL = "https://naas.isalman.dev/no";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Action IDs
export const ACTION_SELECT_REASON_1 = "select_reason_1";
export const ACTION_SELECT_REASON_2 = "select_reason_2";
export const ACTION_SELECT_REASON_3 = "select_reason_3";
export const ACTION_POST_MESSAGE = "post_message";
export const ACTION_REGENERATE_MESSAGE = "regenerate_message";
export const ACTION_CANCEL_MESSAGE = "cancel_message";

if (!SLACK_SIGNING_SECRET) {
  throw new Error("Missing SLACK_SIGNING_SECRET");
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ==============================
// Slack verification
// ==============================
export async function verifySlackRequest(
  req: Request,
  rawBody: string
): Promise<boolean> {
  const timestamp = req.headers.get("X-Slack-Request-Timestamp");
  const slackSignature = req.headers.get("X-Slack-Signature");

  if (!timestamp || !slackSignature) return false;

  // Prevent replay attacks (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 60 * 5) return false;

  const baseString = `v0:${timestamp}:${rawBody}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SLACK_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(baseString)
  );

  const computedSignature =
    "v0=" +
    Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return safeCompare(computedSignature, slackSignature);
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ==============================
// External API & Database
// ==============================
export async function fetchNoReason(): Promise<string> {
  try {
    // Try to fetch from database first
    const reason = await fetchReasonFromDatabase();
    if (reason) {
      return reason;
    }
  } catch (err) {
    console.error("Failed to fetch from database, falling back to API:", err);
  }

  // Fallback to external API if database fails
  const res = await fetch(NO_API_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error("Failed to fetch /no reason");
  }

  const data = await res.json();

  if (!data?.reason) {
    throw new Error("Invalid API response");
  }

  return data.reason;
}

async function fetchReasonFromDatabase(): Promise<string | null> {
  // Get total count of reasons
  const { count, error: countError } = await supabase
    .from("reasons")
    .select("*", { count: "exact", head: true });

  if (countError || !count) {
    throw new Error("Failed to get reasons count");
  }

  // Generate a random offset
  const randomOffset = Math.floor(Math.random() * count);

  // Fetch a random reason using offset
  const { data, error } = await supabase
    .from("reasons")
    .select("reason")
    .range(randomOffset, randomOffset)
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch reason from database");
  }

  return data.reason;
}

export async function fetchMultipleReasons(count: number = 3): Promise<Array<{ emoji: string; text: string }>> {
  const reasons: Array<{ emoji: string; text: string }> = [];
  const emojis = ["1️⃣", "2️⃣", "3️⃣"];

  for (let i = 0; i < count; i++) {
    try {
      const reason = await fetchReasonFromDatabase() || await fetchNoReasonFromAPI();
      reasons.push({ emoji: emojis[i], text: reason });
    } catch (err) {
      console.error(`Failed to fetch reason ${i + 1}:`, err);
      // If one fails, still try to get others
    }
  }

  if (reasons.length === 0) {
    throw new Error("Failed to fetch any reasons");
  }

  return reasons;
}

async function fetchNoReasonFromAPI(): Promise<string> {
  const res = await fetch(NO_API_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error("Failed to fetch /no reason");
  }

  const data = await res.json();

  if (!data?.reason) {
    throw new Error("Invalid API response");
  }

  return data.reason;
}

// ==============================
// Slack response builder
// ==============================
export function buildSlackResponseWithMultipleReasons(reasons: Array<{ emoji: string; text: string }>) {
  // Format the text with emojis and newlines
  const formattedText = reasons.map(r => `${r.emoji} ${r.text}`).join("\n\n");

  return {
    response_type: "ephemeral",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `> ${formattedText}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "1️⃣", emoji: true },
            style: "primary",
            action_id: ACTION_SELECT_REASON_1,
            value: reasons[0].text,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "2️⃣", emoji: true },
            style: "primary",
            action_id: ACTION_SELECT_REASON_2,
            value: reasons[1]?.text || "",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "3️⃣", emoji: true },
            style: "primary",
            action_id: ACTION_SELECT_REASON_3,
            value: reasons[2]?.text || "",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "🔄 Another reason", emoji: true },
            action_id: ACTION_REGENERATE_MESSAGE,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "⛔ Cancel", emoji: true },
            style: "danger",
            action_id: ACTION_CANCEL_MESSAGE,
          },
        ],
      },
    ],
  };
}
