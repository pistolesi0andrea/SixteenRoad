import { NextResponse } from "next/server";
import { createCart, getCart, getStorefrontAvailability } from "@/lib/shopify";

function serviceUnavailableResponse() {
  return NextResponse.json(
    { error: "Shopify Storefront API non configurata in questo ambiente." },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  const availability = getStorefrontAvailability();
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("id");

  if (!availability.enabled) {
    return NextResponse.json({
      ...availability,
      cart: null,
    });
  }

  if (!cartId) {
    return NextResponse.json({
      ...availability,
      cart: null,
    });
  }

  try {
    const cart = await getCart(cartId);

    return NextResponse.json({
      ...availability,
      cart,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...availability,
        cart: null,
        error: error instanceof Error ? error.message : "Cart Shopify non disponibile.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const availability = getStorefrontAvailability();

  if (!availability.enabled) {
    return serviceUnavailableResponse();
  }

  try {
    const body = (await request.json()) as {
      lines?: Array<{
        merchandiseId: string;
        quantity: number;
        attributes?: Array<{ key: string; value: string }>;
      }>;
    };
    const cart = await createCart(body.lines ?? []);

    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Creazione carrello non riuscita." },
      { status: 500 },
    );
  }
}
