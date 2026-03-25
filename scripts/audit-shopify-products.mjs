import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.resolve(".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local");
  }

  const entries = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index);
      const value = line.slice(index + 1).replace(/^"(.*)"$/, "$1");
      return [key, value];
    });

  return Object.fromEntries(entries);
}

function authHeaders(token) {
  if (token.startsWith("shpat_")) {
    return {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": token,
    };
  }

  return {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
  };
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function inferCategory(product) {
  const source = [product.productType, product.title, product.handle, ...(product.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const rules = [
    ["Jeans", ["jeans", "501", "denim"]],
    ["T-Shirt", ["t-shirt", "tshirt", " tee "]],
    ["Camicia", ["camicia", "camicie", "shirt"]],
    ["Maglioni", ["maglione", "maglia", "cardigan", "pullover"]],
    ["Capispalla", ["giacca", "giacche", "giubbetto", "giubbetti", "jacket", "blazer", "coat"]],
    ["Accessori", ["cinta", "papillon", "portafoglio", "pochette", "wallet", "belt"]],
    ["Sneakers", ["sneakers", "scarpa", "scarpe", "mocassino", "loafer", "boot"]],
    ["Bermuda", ["bermuda", "short"]],
    ["Pantalone", ["pantalone", "pantaloni", "trouser"]],
  ];

  return rules.find(([, keywords]) => keywords.some((keyword) => source.includes(keyword)))?.[0] ?? "";
}

function inferColor(product) {
  const source = [product.title, product.handle, ...(product.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
  const rules = [
    ["Bianco", ["bianco", "bianca", "panna", "avorio", "crema", "white", "off-white"]],
    ["Nero", ["nero", "nera", "black"]],
    ["Blu", ["blu", "blue", "navy", "azzurro", "indaco"]],
    ["Verde", ["verde", "salvia", "foresta", "oliva", "olive"]],
    ["Marrone", ["marrone", "bacchetta", "beige", "camel", "cuoio", "tabacco", "tortora", "taupe"]],
    ["Rosso", ["rosso", "rossa", "bordeaux"]],
    ["Grigio", ["grigio", "grigia", "grey", "gray", "antracite", "sale e pepe"]],
  ];

  return rules.find(([, keywords]) => keywords.some((keyword) => source.includes(keyword)))?.[0] ?? "";
}

async function fetchProducts(env) {
  const query = `
    {
      products(first: 100) {
        nodes {
          handle
          title
          productType
          availableForSale
          tags
          options {
            name
            values
          }
          images(first: 1) {
            nodes {
              url
            }
          }
        }
      }
    }
  `;

  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`,
    {
      method: "POST",
      headers: authHeaders(env.SHOPIFY_STOREFRONT_ACCESS_TOKEN),
      body: JSON.stringify({ query }),
    },
  );

  const payload = await response.json();

  if (!response.ok || payload.errors?.length) {
    throw new Error(JSON.stringify(payload.errors ?? payload, null, 2));
  }

  return payload.data.products.nodes;
}

function mainReport(products) {
  const withColorOption = (product) =>
    product.options.some((option) => ["color", "colore"].includes(normalize(option.name)));
  const withSizeOption = (product) =>
    product.options.some((option) => ["size", "taglia", "misura", "unica"].includes(normalize(option.name)));

  const summary = {
    total: products.length,
    missingProductType: products.filter((product) => !product.productType).length,
    missingColorOption: products.filter((product) => !withColorOption(product)).length,
    missingSizeOption: products.filter((product) => !withSizeOption(product)).length,
    withoutImages: products.filter((product) => product.images.nodes.length === 0).length,
  };

  console.log("Shopify catalog audit");
  console.log("====================");
  console.log(`Totale prodotti: ${summary.total}`);
  console.log(`Senza productType: ${summary.missingProductType}`);
  console.log(`Senza opzione Color/Colore: ${summary.missingColorOption}`);
  console.log(`Senza opzione Size/Taglia/Misura: ${summary.missingSizeOption}`);
  console.log(`Senza immagini: ${summary.withoutImages}`);
  console.log("");
  console.log("Prodotti da sistemare subito");
  console.log("----------------------------");

  for (const product of products.slice(0, 100)) {
    const missing = [];

    if (!product.productType) {
      const suggestion = inferCategory(product);
      missing.push(`productType${suggestion ? ` -> ${suggestion}` : ""}`);
    }

    if (!withColorOption(product)) {
      const suggestion = inferColor(product);
      missing.push(`Color/Colore${suggestion ? ` -> ${suggestion}` : ""}`);
    }

    if (!withSizeOption(product)) {
      missing.push("Size/Taglia/Misura");
    }

    if (product.images.nodes.length === 0) {
      missing.push("Immagini");
    }

    if (missing.length > 0) {
      console.log(`- ${product.title} (${product.handle})`);
      console.log(`  ${missing.join(" | ")}`);
    }
  }
}

const env = loadEnv();
const products = await fetchProducts(env);
mainReport(products);
