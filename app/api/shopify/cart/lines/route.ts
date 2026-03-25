import { NextResponse } from "next/server";
import {
  addCartLines,
  getStorefrontAvailability,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify";

function serviceUnavailableResponse() {
  return NextResponse.json(
    { error: "Shopify Storefront API non configurata in questo ambiente." },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  if (!getStorefrontAvailability().enabled) {
    return serviceUnavailableResponse();
  }

  try {
    const body = (await request.json()) as {
      cartId?: string;
      lines?: Array<{
        merchandiseId: string;
        quantity: number;
        attributes?: Array<{ key: string; value: string }>;
      }>;
    };

    if (!body.cartId || !body.lines?.length) {
      return NextResponse.json(
        { error: "cartId e lines sono obbligatori." },
        { status: 400 },
      );
    }

    const cart = await addCartLines(body.cartId, body.lines);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Aggiunta linee al carrello non riuscita." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!getStorefrontAvailability().enabled) {
    return serviceUnavailableResponse();
  }

  try {
    const body = (await request.json()) as {
      cartId?: string;
      lines?: Array<{ id: string; quantity: number }>;
    };

    if (!body.cartId || !body.lines?.length) {
      return NextResponse.json(
        { error: "cartId e lines sono obbligatori." },
        { status: 400 },
      );
    }

    const cart = await updateCartLines(body.cartId, body.lines);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Aggiornamento linee non riuscito." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!getStorefrontAvailability().enabled) {
    return serviceUnavailableResponse();
  }

  try {
    const body = (await request.json()) as {
      cartId?: string;
      lineIds?: string[];
    };

    if (!body.cartId || !body.lineIds?.length) {
      return NextResponse.json(
        { error: "cartId e lineIds sono obbligatori." },
        { status: 400 },
      );
    }

    const cart = await removeCartLines(body.cartId, body.lineIds);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Rimozione linee non riuscita." },
      { status: 500 },
    );
  }
}
