import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type CommerceRequestKind =
  | "back-in-stock"
  | "store-pickup";

type CommerceRequestBase = {
  kind: CommerceRequestKind;
  productId: string;
  productHandle: string;
  productTitle: string;
  variantId?: string | null;
  size?: string | null;
};

export type BackInStockRequest = CommerceRequestBase & {
  kind: "back-in-stock";
  email: string;
};

export type StoreServiceRequest = CommerceRequestBase & {
  kind: "store-pickup";
  name: string;
  email: string;
  phone: string;
  preferredSlot?: string;
  notes?: string;
  locationId?: string | null;
  locationName?: string | null;
};

export type CommerceRequestPayload = BackInStockRequest | StoreServiceRequest;

const WEBHOOK_URL = process.env.SIXTEENROAD_COMMERCE_REQUESTS_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.SIXTEENROAD_COMMERCE_REQUESTS_WEBHOOK_SECRET;

function requestsDirectory() {
  return path.join(process.cwd(), ".data", "commerce-requests");
}

export async function persistCommerceRequest(payload: CommerceRequestPayload) {
  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload,
  };

  await mkdir(requestsDirectory(), { recursive: true });
  await appendFile(
    path.join(requestsDirectory(), `${payload.kind}.jsonl`),
    `${JSON.stringify(record)}\n`,
    "utf8",
  );

  if (WEBHOOK_URL) {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WEBHOOK_SECRET ? { "x-sixteenroad-secret": WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(record),
      cache: "no-store",
    });
  }

  return record;
}
