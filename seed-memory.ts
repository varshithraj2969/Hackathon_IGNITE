import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { HindsightClient } from "@vectorize-io/hindsight-client";

// Prefer .env.local for local demo runs (Next.js uses it too),
// while still allowing process.env to win if already set.
loadEnv({ path: ".env.local", override: false });

const bankId = process.env.HINDSIGHT_BANK_ID ?? "ai-resource-sentinel";
const baseUrl =
  process.env.HINDSIGHT_BASE_URL ?? "https://api.hindsight.vectorize.io";
const apiKey = process.env.HINDSIGHT_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing HINDSIGHT_API_KEY. Add it to .env.local before seeding."
  );
}

const client = new HindsightClient({ baseUrl, apiKey });

async function main() {
  const memories = [
    "The Marketing team has a Midjourney Pro seat that has been idle for 22 days.",
    'An expensive GPT-4 API key is assigned to a "Testing" project with zero calls in 3 weeks.',
    "Design team has a spare Figma license from an employee who left.",
  ];

  for (const text of memories) {
    await client.retain(bankId, text);
    console.log(`Retained: ${text}`);
  }

  console.log(`\nSeed complete. Bank: ${bankId}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

