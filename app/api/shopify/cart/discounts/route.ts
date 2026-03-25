import { NextResponse } from "next/server";
import { getStorefrontAvailability, updateCartDiscountCodes } from "@/lib/shopify";

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
      discountCode?: string;
      discountCodes?: string[];
    };
    const discountCodes = body.discountCodes?.length
      ? body.discountCodes
      : body.discountCode
        ? [body.discountCode]
        : [];

    if (!body.cartId || discountCodes.length === 0) {
      return NextResponse.json(
        { error: "cartId e discountCode sono obbligatori." },
        { status: 400 },
      );
    }

    const cart = await updateCartDiscountCodes(body.cartId, discountCodes);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Applicazione codice sconto non riuscita.",
      },
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
    };

    if (!body.cartId) {
      return NextResponse.json({ error: "cartId e obbligatorio." }, { status: 400 });
    }

    const cart = await updateCartDiscountCodes(body.cartId, []);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Rimozione codice sconto non riuscita.",
      },
      { status: 500 },
    );
  }
}
