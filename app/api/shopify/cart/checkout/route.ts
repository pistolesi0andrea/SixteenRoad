import { NextResponse } from "next/server";
import { getStorefrontAvailability, prepareCartForCheckout } from "@/lib/shopify";
import { ShopifyCheckoutInput } from "@/types/shopify";

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
      input?: ShopifyCheckoutInput;
    };

    if (!body.cartId || !body.input) {
      return NextResponse.json(
        { error: "cartId e input checkout sono obbligatori." },
        { status: 400 },
      );
    }

    const cart = await prepareCartForCheckout(body.cartId, body.input);

    return NextResponse.json({
      cart,
      checkoutUrl: cart?.checkoutUrl ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Preparazione checkout Shopify non riuscita.",
      },
      { status: 500 },
    );
  }
}
