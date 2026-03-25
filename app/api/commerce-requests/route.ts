import { NextResponse } from "next/server";
import { persistCommerceRequest } from "@/lib/commerce-requests";

function getStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalStringValue(value: unknown) {
  const normalizedValue = getStringValue(value);
  return normalizedValue || undefined;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const kind = getStringValue(body.kind);
    const productId = getStringValue(body.productId);
    const productHandle = getStringValue(body.productHandle);
    const productTitle = getStringValue(body.productTitle);
    const variantId = getOptionalStringValue(body.variantId);
    const size = getOptionalStringValue(body.size);

    if (!kind || !productId || !productHandle || !productTitle) {
      return NextResponse.json(
        { error: "Dati prodotto incompleti per registrare la richiesta." },
        { status: 400 },
      );
    }

    if (kind === "back-in-stock") {
      const email = getStringValue(body.email);

      if (!email) {
        return NextResponse.json(
          { error: "L'email e obbligatoria per la richiesta di riassortimento." },
          { status: 400 },
        );
      }

      const record = await persistCommerceRequest({
        kind,
        email,
        productId,
        productHandle,
        productTitle,
        variantId,
        size,
      });

      return NextResponse.json({ ok: true, record });
    }

    if (kind !== "store-pickup") {
      return NextResponse.json({ error: "Tipo richiesta non supportato." }, { status: 400 });
    }

    const name = getStringValue(body.name);
    const email = getStringValue(body.email);
    const phone = getStringValue(body.phone);

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Nome, email e telefono sono obbligatori." },
        { status: 400 },
      );
    }

    const record = await persistCommerceRequest({
      kind,
      name,
      email,
      phone,
      preferredSlot: getOptionalStringValue(body.preferredSlot),
      notes: getOptionalStringValue(body.notes),
      locationId: getOptionalStringValue(body.locationId),
      locationName: getOptionalStringValue(body.locationName),
      productId,
      productHandle,
      productTitle,
      variantId,
      size,
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Richiesta non registrata per un errore server.",
      },
      { status: 500 },
    );
  }
}
