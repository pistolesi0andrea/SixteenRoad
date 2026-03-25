import { ShopifyImage, ShopifyProduct, ShopifyProductDetails, ShopifyProductVariant } from "@/types/shopify";

interface MockProductSeed {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  color: string;
  sizes: string[];
  price: number;
  folder: string;
  files: string[];
  description: string;
  composition: string;
  fitNotes: string;
  tags?: string[];
}

function localImages(folder: string, files: string[]) {
  return files.map((file) => `/products/abbigliamento/${folder}/${encodeURIComponent(file)}`);
}

const mockProductSeeds: MockProductSeed[] = [
  {
    handle: "kimono-verde-militare",
    title: "Kimono Verde Militare",
    vendor: "Sixteen Road Edit",
    productType: "Giacche",
    color: "Olive",
    sizes: ["S", "M", "L"],
    price: 98,
    folder: "kimono-verde",
    files: ["Image (42).jpg", "Image (44).jpg"],
    description: "Giacca leggera a portafoglio dal taglio essenziale, con tono verde militare e spirito utility.",
    composition: "100% cotone",
    fitNotes: "Vestibilita regolare con spalla morbida e linea rilassata.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "kimono-tabacco",
    title: "Kimono Tabacco",
    vendor: "Sixteen Road Edit",
    productType: "Giacche",
    color: "Tabacco",
    sizes: ["S", "M", "L"],
    price: 98,
    folder: "kimono-marrone",
    files: ["Image (41).jpg", "Image (43).jpg"],
    description: "Interpretazione morbida della giacca kimono, in un marrone profondo da layering quotidiano.",
    composition: "100% cotone",
    fitNotes: "Taglio regolare, facile da indossare aperta o chiusa.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "maglia-riga-marina",
    title: "Maglia Riga Marina",
    vendor: "Sixteen Road Edit",
    productType: "Maglioni",
    color: "Panna / Navy",
    sizes: ["S", "M", "L"],
    price: 79,
    folder: "maglia-righe",
    files: ["Image (39).jpg", "Image (40).jpg"],
    description: "Maglia a righe dal sapore marinaro, con costruzione morbida e proporzione rilassata.",
    composition: "100% cotone lavorato",
    fitNotes: "Fit comodo, manica ampia e corpo dritto.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "jeans-indigo-risvolto",
    title: "Jeans Indigo Risvolto",
    vendor: "Sixteen Road Edit",
    productType: "Jeans",
    color: "Indigo",
    sizes: ["30", "32", "34", "36"],
    price: 92,
    folder: "jeans",
    files: ["Image (37).jpg", "Image (38).jpg"],
    description: "Denim blu pieno con gamba ampia e risvolto deciso, pensato per un look pulito ma presente.",
    composition: "100% cotone denim",
    fitNotes: "Vita regolare e gamba dritta ampia.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "cardigan-panna-heritage",
    title: "Cardigan Panna Heritage",
    vendor: "Sixteen Road Edit",
    productType: "Maglioni",
    color: "Panna",
    sizes: ["S", "M", "L"],
    price: 100,
    folder: "cardigan1",
    files: ["Image (35).jpg", "Image (36).jpg"],
    description: "Cardigan corposo a maglia aperta, con texture ricca e tono naturale.",
    composition: "100% cotone pesante",
    fitNotes: "Vestibilita morbida con linee ampie sul corpo.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "cardigan-olive-melange",
    title: "Cardigan Olive Melange",
    vendor: "Sixteen Road Edit",
    productType: "Maglioni",
    color: "Olive",
    sizes: ["M", "L", "XL"],
    price: 94,
    folder: "cardigan2",
    files: ["Image (30).jpg", "Image (31).jpg", "Image (34).jpg"],
    description: "Cardigan-overshirt in maglia melange, con tasche frontali e tono verde terroso.",
    composition: "100% cotone lavorato",
    fitNotes: "Fit rilassato, ideale sopra tee e canotte leggere.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "camicia-traforata-oliva",
    title: "Camicia Traforata Oliva",
    vendor: "Sixteen Road Edit",
    productType: "Camicie",
    color: "Olive",
    sizes: ["S", "M", "L"],
    price: 82,
    folder: "camicia1",
    files: ["Image (26).jpg", "Image (28).jpg"],
    description: "Camicia in maglia traforata con mano estiva e tono olivato molto morbido.",
    composition: "100% cotone lavorato",
    fitNotes: "Vestibilita regolare, da portare aperta o abbottonata.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "camicia-sabbia-pocket",
    title: "Camicia Sabbia Pocket",
    vendor: "Sixteen Road Edit",
    productType: "Camicie",
    color: "Sabbia",
    sizes: ["M", "L", "XL"],
    price: 88,
    folder: "camicia3",
    files: ["Image (8).jpg", "Image (9).jpg"],
    description: "Camicia leggera con tasche applicate e taglio morbido, in una tonalita sabbia neutra.",
    composition: "55% viscosa, 45% cotone",
    fitNotes: "Corpo rilassato con spalla leggermente scesa.",
    tags: ["nuovi-arrivi"],
  },
  {
    handle: "jeans-nero-straight",
    title: "Jeans Nero Straight",
    vendor: "Sixteen Road Edit",
    productType: "Jeans",
    color: "Black",
    sizes: ["30", "32", "34", "36"],
    price: 89,
    folder: "jeans2",
    files: ["Image (24).jpg", "Image (25).jpg"],
    description: "Jeans neri dal taglio dritto, puliti e versatili, con impostazione essenziale.",
    composition: "100% cotone denim",
    fitNotes: "Vestibilita regolare con linea dritta sul fondo.",
    tags: ["saldi"],
  },
  {
    handle: "pantalone-moro-sartoriale",
    title: "Pantalone Moro Sartoriale",
    vendor: "Sixteen Road Edit",
    productType: "Pantaloni",
    color: "Moro",
    sizes: ["30", "32", "34", "36"],
    price: 96,
    folder: "pantalone",
    files: ["Image (32).jpg", "Image (33).jpg"],
    description: "Pantalone fluido a gamba ampia, con tono scuro elegante e costruzione pulita.",
    composition: "70% poliestere, 30% viscosa",
    fitNotes: "Vita regolare e caduta piena sulla gamba.",
    tags: ["saldi"],
  },
  {
    handle: "cardigan-sabbia-melange",
    title: "Cardigan Sabbia Melange",
    vendor: "Sixteen Road Edit",
    productType: "Maglioni",
    color: "Sabbia",
    sizes: ["M", "L", "XL"],
    price: 94,
    folder: "cardigan3",
    files: ["Image (21).jpg", "Image (22).jpg", "Image (23).jpg"],
    description: "Cardigan in tono sabbia melange, leggero ma presente, con una costruzione morbida da layering.",
    composition: "100% cotone lavorato",
    fitNotes: "Fit rilassato con volumi morbidi sul busto.",
    tags: ["saldi"],
  },
  {
    handle: "camicia-traforata-nera",
    title: "Camicia Traforata Nera",
    vendor: "Sixteen Road Edit",
    productType: "Camicie",
    color: "Black",
    sizes: ["S", "M", "L"],
    price: 82,
    folder: "camicia2",
    files: ["Image (27).jpg", "Image (29).jpg"],
    description: "Camicia in maglia traforata nera, piu decisa e minimale, con bella profondita visiva.",
    composition: "100% cotone lavorato",
    fitNotes: "Linea regolare con manica comoda.",
    tags: ["saldi"],
  },
  {
    handle: "bermuda-sabbia",
    title: "Bermuda Sabbia",
    vendor: "Sixteen Road Edit",
    productType: "Bermuda",
    color: "Sabbia",
    sizes: ["30", "32", "34"],
    price: 74,
    folder: "bermuda1",
    files: ["Image (11).jpg", "Image (12).jpg"],
    description: "Bermuda pulito dalla linea ampia, in una tonalita sabbia facile da abbinare.",
    composition: "100% cotone",
    fitNotes: "Lunghezza al ginocchio con gamba ampia.",
    tags: ["saldi"],
  },
  {
    handle: "bermuda-nero",
    title: "Bermuda Nero",
    vendor: "Sixteen Road Edit",
    productType: "Bermuda",
    color: "Black",
    sizes: ["30", "32", "34"],
    price: 74,
    folder: "bermuda2",
    files: ["Image (1).jpg", "Image (7).jpg", "Image.jpg"],
    description: "Bermuda nero dal taglio ampio e pulito, con impostazione piu sartoriale.",
    composition: "100% cotone",
    fitNotes: "Fit comodo con volume largo sulla gamba.",
    tags: ["saldi"],
  },
];

function priceToMoney(price: number) {
  return {
    amount: Math.min(price, 100).toFixed(2),
    currencyCode: "EUR",
  };
}

function buildTags(seed: MockProductSeed) {
  return [...new Set(["abbigliamento", ...(seed.tags ?? [])])];
}

function buildCreatedAt(index: number) {
  const base = new Date(Date.UTC(2026, 2, 19, 10, 0, 0));
  base.setUTCDate(base.getUTCDate() - index);
  return base.toISOString();
}

function buildImages(seed: MockProductSeed): ShopifyImage[] {
  return localImages(seed.folder, seed.files).map((url, imageIndex) => ({
    url,
    altText: `${seed.title} view ${imageIndex + 1}`,
  }));
}

function buildSizeGuide(seed: MockProductSeed): string[] {
  if (["Jeans", "Pantaloni", "Bermuda"].includes(seed.productType)) {
    return seed.sizes.map((size) => `Taglia ${size}: vita regolare e gamba con buona agibilita.`);
  }

  return seed.sizes.map((size) => `Taglia ${size}: vestibilita regolare, consigliata se indossi normalmente ${size}.`);
}

function buildVariants(seed: MockProductSeed, index: number, price: ReturnType<typeof priceToMoney>) {
  const unavailableVariantIndex = seed.sizes.length > 1 && index % 4 === 0 ? seed.sizes.length - 1 : -1;

  return seed.sizes.map((size, variantIndex) => ({
    node: {
      id: `var_${index + 1}_${variantIndex + 1}`,
      title: size,
      availableForSale: variantIndex !== unavailableVariantIndex,
      price,
      selectedOptions: [
        {
          name: "Taglia",
          value: size,
        },
        {
          name: "Colore",
          value: seed.color,
        },
      ],
    } satisfies ShopifyProductVariant,
  }));
}

function buildDetails(seed: MockProductSeed): ShopifyProductDetails {
  return {
    composition: seed.composition,
    fitNotes: seed.fitNotes,
    sizeGuide: buildSizeGuide(seed),
  };
}

export const mockProducts: ShopifyProduct[] = mockProductSeeds.map((seed, index) => {
  const price = priceToMoney(seed.price);
  const images = buildImages(seed);

  return {
    id: `prod_${index + 1}`,
    handle: seed.handle,
    title: seed.title,
    vendor: seed.vendor,
    createdAt: buildCreatedAt(index),
    description: seed.description,
    descriptionHtml: `<p>${seed.description}</p>`,
    availableForSale: true,
    productType: seed.productType,
    tags: buildTags(seed),
    priceRange: {
      minVariantPrice: price,
      maxVariantPrice: price,
    },
    featuredImage: images[0] ?? null,
    images: {
      edges: images.map((image) => ({
        node: image,
      })),
    },
    variants: {
      edges: buildVariants(seed, index, price),
    },
    options: [
      {
        name: "Colore",
        values: [seed.color],
      },
      {
        name: "Taglia",
        values: seed.sizes,
      },
    ],
    details: buildDetails(seed),
  };
});
