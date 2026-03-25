import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type NewsletterSignupSource = "popup" | "footer";

type NewsletterSignupPayload = {
  email: string;
  source: NewsletterSignupSource;
};

const NEWSLETTER_WEBHOOK_URL = process.env.SIXTEENROAD_NEWSLETTER_WEBHOOK_URL;
const NEWSLETTER_WEBHOOK_SECRET = process.env.SIXTEENROAD_NEWSLETTER_WEBHOOK_SECRET;

function subscriptionsDirectory() {
  return path.join(process.cwd(), ".data", "newsletter-signups");
}

export async function persistNewsletterSignup(payload: NewsletterSignupPayload) {
  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    email: payload.email.trim().toLowerCase(),
    source: payload.source,
  };

  await mkdir(subscriptionsDirectory(), { recursive: true });
  await appendFile(
    path.join(subscriptionsDirectory(), "newsletter.jsonl"),
    `${JSON.stringify(record)}\n`,
    "utf8",
  );

  if (NEWSLETTER_WEBHOOK_URL) {
    await fetch(NEWSLETTER_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(NEWSLETTER_WEBHOOK_SECRET
          ? { "x-sixteenroad-newsletter-secret": NEWSLETTER_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(record),
      cache: "no-store",
    });
  }

  return record;
}
