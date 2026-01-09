import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const REASONS_JSON_URL =
  "https://raw.githubusercontent.com/hotheadhacker/no-as-a-service/main/reasons.json";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Allow GET for manual triggering
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // 1. Check the last update timestamp
    const { data: lastReason, error: fetchError } = await supabase
      .from("reasons")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned", which is fine for empty table
      throw new Error(`Failed to fetch last update: ${fetchError.message}`);
    }

    const now = Date.now();
    const lastUpdateTime = lastReason
      ? new Date(lastReason.updated_at).getTime()
      : 0;
    const timeSinceLastUpdate = now - lastUpdateTime;

    console.log(`Last update: ${lastReason?.updated_at || "never"}`);
    console.log(
      `Time since last update: ${
        timeSinceLastUpdate / 1000 / 60 / 60 / 24
      } days`
    );

    // 2. Check if update is needed (more than a week)
    if (timeSinceLastUpdate < ONE_WEEK_MS && lastReason) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Update not needed yet",
          lastUpdate: lastReason.updated_at,
          nextUpdate: new Date(
            lastUpdateTime + ONE_WEEK_MS
          ).toISOString(),
          daysSinceUpdate: Math.floor(
            timeSinceLastUpdate / 1000 / 60 / 60 / 24
          ),
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 3. Fetch new reasons from GitHub
    console.log("Fetching new reasons from GitHub...");
    const reasonsResponse = await fetch(REASONS_JSON_URL);

    if (!reasonsResponse.ok) {
      throw new Error(
        `Failed to fetch reasons: ${reasonsResponse.status} ${reasonsResponse.statusText}`
      );
    }

    const newReasons = await reasonsResponse.json();

    // 4. Validate the new reasons list
    if (!Array.isArray(newReasons) || newReasons.length === 0) {
      throw new Error("Invalid or empty reasons list from source");
    }

    console.log(`Fetched ${newReasons.length} new reasons`);

    // 5. Delete all existing reasons
    console.log("Deleting existing reasons...");
    const { error: deleteError } = await supabase
      .from("reasons")
      .delete()
      .neq("id", 0); // Delete all rows (neq 0 matches everything)

    if (deleteError) {
      throw new Error(
        `Failed to delete existing reasons: ${deleteError.message}`
      );
    }

    // 6. Insert new reasons in batches (Supabase has a limit per request)
    console.log("Inserting new reasons...");
    const BATCH_SIZE = 1000;
    let insertedCount = 0;

    for (let i = 0; i < newReasons.length; i += BATCH_SIZE) {
      const batch = newReasons.slice(i, i + BATCH_SIZE);
      const reasonsToInsert = batch.map((reason: string) => ({ reason }));

      const { error: insertError } = await supabase
        .from("reasons")
        .insert(reasonsToInsert);

      if (insertError) {
        throw new Error(
          `Failed to insert reasons batch: ${insertError.message}`
        );
      }

      insertedCount += batch.length;
      console.log(`Inserted batch: ${insertedCount}/${newReasons.length}`);
    }

    // 7. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Reasons updated successfully",
        reasonsCount: newReasons.length,
        previousUpdate: lastReason?.updated_at || "never",
        currentUpdate: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Update failed:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
