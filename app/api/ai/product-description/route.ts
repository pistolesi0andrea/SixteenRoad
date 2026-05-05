import { NextResponse } from "next/server";
import { getProduct } from "@/lib/shopify";
import { ShopifyProduct } from "@/types/shopify";

export const dynamic = "force-dynamic";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? "llava";

interface GenerateDescriptionRequestBody {
  handle?: unknown;
  title?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  vendor?: unknown;
  productType?: unknown;
  tags?: unknown;
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function getProductImageUrl(product: ShopifyProduct | null) {
  return product?.featuredImage?.url ?? product?.images.edges[0]?.node?.url ?? "";
}

async function encodeImageAsBase64(imageUrl: string) {
  if (!imageUrl) {
    return null;
  }

  try {
    const response = await fetch(imageUrl, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const bytes = await response.arrayBuffer();
    return Buffer.from(bytes).toString("base64");
  } catch {
    return null;
  }
}

function buildPrompt({
  title,
  description,
  vendor,
  productType,
  tags,
}: {
  title: string;
  description: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
}) {
  const contextLines = [
    `Titolo prodotto: ${title}`,
    `Descrizione base: ${description || "Nessuna descrizione fornita."}`,
    vendor ? `Brand/Venditore: ${vendor}` : "",
    productType ? `Tipologia: ${productType}` : "",
    tags?.length ? `Tag: ${tags.join(", ")}` : "",
  ].filter(Boolean);

  return `
Sei un copywriter di ecommerce fashion per Sixteen Road.

Obiettivo:
- riscrivere la descrizione prodotto in italiano
- tono editoriale, curato, premium ma naturale
- non scrivere il prezzo
- non usare emoji
- non usare elenchi puntati
- massimo 2 paragrafi brevi
- usa l'immagine per capire silhouette, mood e presenza del capo
- NON inventare dati tecnici non confermati dal testo
- se il materiale o altri dettagli tecnici sono presenti nel testo base, puoi mantenerli
- evita frasi gonfie o troppo artificiali

Contesto prodotto:
${contextLines.join("\n")}

Restituisci solo la descrizione finale, senza titolo, senza virgolette e senza spiegazioni.
`.trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateDescriptionRequestBody;
    const handle = getStringValue(body.handle);

    let product: ShopifyProduct | null = null;
    if (handle) {
      product = await getProduct(handle);
    }

    const title = getStringValue(body.title) || product?.title || "";
    const description = getStringValue(body.description) || product?.description || "";
    const imageUrl = getStringValue(body.imageUrl) || getProductImageUrl(product);
    const vendor = getStringValue(body.vendor) || product?.vendor || "";
    const productType = getStringValue(body.productType) || product?.productType || "";
    const tags = getStringArray(body.tags).length > 0 ? getStringArray(body.tags) : product?.tags ?? [];

    if (!title) {
      return NextResponse.json(
        { error: "Titolo prodotto mancante per generare la descrizione." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt({
      title,
      description,
      vendor,
      productType,
      tags,
    });

    const encodedImage = await encodeImageAsBase64(imageUrl);

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_VISION_MODEL,
        prompt,
        stream: false,
        ...(encodedImage ? { images: [encodedImage] } : {}),
      }),
      cache: "no-store",
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return NextResponse.json(
        {
          error: `Ollama ha risposto con errore ${ollamaResponse.status}.`,
          details: errorText,
        },
        { status: 502 },
      );
    }

    const payload = (await ollamaResponse.json()) as { response?: string };
    const generatedDescription = getStringValue(payload.response);

    if (!generatedDescription) {
      return NextResponse.json(
        { error: "Ollama non ha restituito nessuna descrizione." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      model: OLLAMA_VISION_MODEL,
      description: generatedDescription,
      source: {
        handle: product?.handle ?? handle ?? null,
        title,
        imageAnalyzed: Boolean(encodedImage),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Generazione descrizione non riuscita per un errore server.",
      },
      { status: 500 },
    );
  }
}
