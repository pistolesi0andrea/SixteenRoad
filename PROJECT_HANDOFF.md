# PROJECT_HANDOFF.md

## 1. Obiettivo generale del progetto

Stiamo costruendo il nuovo storefront headless di **Sixteen Road**, un ecommerce moda/vintage con backend Shopify e frontend custom in Next.js deployato su Vercel.

Obiettivi principali:
- mantenere un’identità visiva editoriale, premium e riconoscibile
- rendere il flusso ecommerce più pulito, soprattutto da mobile
- usare Shopify come backend per prodotti, carrello, checkout, gift card e ordini
- usare il frontend custom come esperienza principale del sito pubblico
- migliorare UX, leggibilità, performance percepita, condivisione social e tracciamento analytics

Risultato finale atteso:
- sito pubblico stabile su `https://www.sixteenroad.com`
- navigazione mobile/desktop coerente
- checkout Shopify funzionante e non ambiguo
- tracking base funzionante
- struttura pronta per future integrazioni AI lato descrizioni prodotto

## 2. Stack tecnico usato

- **Framework**: Next.js `16.1.7` con App Router
- **Linguaggio**: TypeScript
- **UI**: React `19.2.3`
- **Styling**: Tailwind CSS v4 + classi custom brand
- **Deployment**: Vercel
- **Backend ecommerce**: Shopify Storefront API
- **Cart / checkout**: gestione custom nel frontend, finalizzazione su checkout Shopify
- **Analytics attivi nel codice**:
  - Vercel Analytics
  - Microsoft Clarity
  - Google Analytics 4
  - Meta Pixel supportato a livello codice/env
- **AI / descrizioni prodotto**:
  - route preparata per integrazione locale con **Ollama**
- **Altre note tecniche**:
  - immagini Shopify CDN gestite con bypass dell’optimizer dove necessario
  - local storage protetto con helper safe
  - fallback/loading/error pages presenti per migliorare percezione e robustezza

Struttura repo principale:
- `app/` pagine e route API
- `components/` componenti UI
- `lib/` helper, Shopify logic, catalog logic
- `types/` tipi TS
- `public/` asset, immagini, loghi

## 3. Stato attuale del progetto

### Cosa è già implementato e funziona

- storefront headless online su Vercel
- routing principali:
  - home
  - collezioni
  - prodotto
  - contatti
  - spedizioni
  - resi
  - FAQ
  - checkout preview
  - gift card
- carrello custom collegato a Shopify
- redirect verso checkout Shopify funzionante
- opzione `Ritira in store` spostata nel checkout invece che nella scheda prodotto
- menu mobile personalizzato con categorie annidate
- filtri mobile a tendina chiusi di default
- desktop e mobile differenziati dove richiesto
- popup zoom immagine prodotto con doppio click / doppio tap
- preview social del sito e dei prodotti migliorata
- favicon/icona sito gestita tramite route dinamiche
- Clarity attivo e verificato
- GA4 installato a livello base e avviato
- Vercel Analytics lasciato attivo

### Cosa è incompleto o da verificare

- logo del checkout Shopify aggiornato, ma il click dal checkout può ancora portare al vecchio storefront Shopify
- redirect del vecchio storefront Shopify verso il nuovo sito **non ancora implementato**
- GA4 traccia traffico base, ma **non** è ancora configurato come ecommerce completo
- Meta Pixel è supportato dal codice, ma va verificato lato env/Meta
- integrazione AI con Ollama è scaffoldata, ma non è collegata a una UI/admin flow
- gift card: va verificata la configurazione Shopify finale del prodotto/handle/tagli

## 4. File e componenti principali

### Layout e struttura globale
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\layout.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\layout.tsx)
  - layout globale
  - metadata sito
  - Header/Footer
  - WhatsApp button
  - Marketing analytics
  - Vercel Analytics

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\globals.css](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\globals.css)
  - stile globale
  - branding, utility, tipografia

### Home e navigazione
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\page.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\page.tsx)
  - homepage
  - CTA hero
  - `Esplora Collezione` + `Esplora / Saldi`

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\Header.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\Header.tsx)
  - menu desktop/mobile
  - submenu `Abbigliamento`
  - categorie top-level come `Sneakers`, `Accessori`

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\Footer.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\Footer.tsx)
  - footer a 3 colonne
  - brand / support / legal

### Catalogo e card
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\catalog\CollectionCatalogView.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\catalog\CollectionCatalogView.tsx)
  - pagina collezione
  - filtri desktop/mobile
  - griglia prodotti

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\catalog\CatalogProductCard.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\catalog\CatalogProductCard.tsx)
  - card catalogo
  - badge `SOLD OUT`
  - adattamento 2 colonne mobile

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\ProductCard.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\ProductCard.tsx)
  - card prodotto usata in altri contesti

### Prodotto
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\product\ProductDetailView.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\product\ProductDetailView.tsx)
  - scheda prodotto principale
  - gallery
  - taglie
  - CTA
  - shipping / returns
  - popup zoom immagine

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\products\[handle]\page.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\products\[handle]\page.tsx)
  - metadata dinamici prodotto
  - preview social prodotto

### Carrello e checkout
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\cart\CartProvider.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\cart\CartProvider.tsx)
  - stato carrello
  - sync Shopify

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\cart\CartDrawer.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\cart\CartDrawer.tsx)
  - drawer carrello
  - testo più leggibile
  - link prodotto da immagine e titolo

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\cart\CheckoutPreview.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\cart\CheckoutPreview.tsx)
  - pre-checkout custom
  - summary mobile-first
  - ritiro in store / consegna
  - bottone unico `Paga adesso`

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\shopify.ts](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\shopify.ts)
  - Storefront API
  - cart/checkout helpers
  - fix URL checkout Shopify

### Gift card
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\buoni-regalo\page.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\buoni-regalo\page.tsx)
  - pagina gift card

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\GiftCardBuilder.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\GiftCardBuilder.tsx)
  - builder gift card
  - legge le varianti/tagli da Shopify

### Analytics e AI
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\analytics\MarketingAnalytics.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\components\analytics\MarketingAnalytics.tsx)
  - Clarity
  - GA4
  - Meta Pixel

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\api\ai\product-description\route.ts](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\api\ai\product-description\route.ts)
  - route scaffoldata per generazione descrizioni con Ollama vision model

### Utility e stabilità
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\browser-storage.ts](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\browser-storage.ts)
  - accesso sicuro a localStorage

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\product-helpers.ts](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\product-helpers.ts)
  - helper immagini Shopify
  - image optimization bypass dove necessario

- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\loading.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\loading.tsx)
- [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\error.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\error.tsx)
  - loading/error UI per evitare schermate bianche

## 5. Modifiche già fatte

### Layout e UI generali
- definita una direzione visiva editoriale, chiara e coerente col brand
- impostato metadata, Open Graph e Twitter card globali
- rimosso l’effetto neve aggiunto temporaneamente
- migliorata la gestione favicon/icona sito tramite route dinamiche:
  - [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\icon.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\icon.tsx)
  - [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\apple-icon.tsx](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\app\apple-icon.tsx)
- preparato file locale per checkout logo circolare:
  - [C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\public\checkout-logo-circle.png](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\public\checkout-logo-circle.png)

### Home
- aggiunta CTA `Esplora / Saldi` accanto a `Esplora Collezione`
- bottone saldi reso più coerente col brand

### Footer
- ricostruito footer in 3 colonne reali
- aumentata leggibilità di `Support` e `Legal`
- rimosse CTA/sezioni newsletter dal frontend

### Menu e navigazione
- ridotti i font del menu hamburger mobile
- `Abbigliamento` su mobile è espandibile con categorie sotto
- `Sneakers` portata fuori da `Abbigliamento` come top-level
- `Accessori` portato fuori da `Abbigliamento` come top-level
- aggiunta categoria `Gilet`
- desktop dove richiesto lasciato com’era, evitando di degradare il look PC

### Catalogo / collezioni
- su mobile passaggio a **2 prodotti per riga**
- card riequilibrate per il layout a 2 colonne
- filtri mobile:
  - chiusi di default
  - bottone `Filtri`
  - apertura inline a tendina
  - niente bottone `Chiudi`, si richiudono ricliccando su `Filtri`
  - dimensioni interne più compatte
- desktop filtri riportati alla logica precedente dopo una regressione

### Card prodotto
- badge `SOLD OUT` molto più evidente
- badge centrato sull’immagine
- immagine leggermente opacizzata quando esaurito
- bottone `+` disabilitato dove opportuno

### Scheda prodotto
- pulizia forte della colonna destra
- tolti:
  - composizione
  - vestibilità
  - condizione del capo
  - guida alle taglie
  - misure del capo
  - colore
  - archivio
  - categoria
- descrizione spostata più in alto dentro un box bianco
- mantenuti solo `Spedizione` e `Resi`
- rimossa dal frontend la card `Servizi boutique / Ritira in store`
- popup immagine prodotto:
  - apertura con doppio click / doppio tap
  - zoom
  - chiusura con una sola `X` dentro il riquadro immagine

### Carrello
- aumentata leggibilità generale
- `Subtotal`, `Spedizione`, `Totale stimato` più marcati e bold
- click su immagine e titolo prodotto porta alla pagina prodotto

### Checkout preview
- rework importante del flusso
- su mobile si vede prima il riepilogo carrello, non il blocco contatti
- rimosso il blocco `Carte / PayPal / Scalapay`
- lasciato solo il bottone unico `Paga adesso`
- bottone spostato sotto il totale
- `Contatto cliente` e `Consegna` resi più grandi e bold
- pulito il copy del riepilogo ordine
- tolti riferimenti a `SDA Express 24/48h` e alla spedizione “entro le 13:00”
- rimozione di un ulteriore blocco `Spedizione Italia / 5,00 €` dal checkout
- click su immagine e titolo del riepilogo porta al prodotto
- aumentati i font dei testi su checkout e summary
- logica ritiro in store mantenuta lato checkout

### Logica Shopify / checkout
- fix importante sui checkout URL Shopify per evitare `404`
- buyer identity resa più tollerante a campi vuoti
- ritiro in store reso compatibile col checkout Shopify

### Immagini
- risolto problema immagini prodotto nuove non visibili sul live a causa dell’optimizer Vercel / Next
- bypass `unoptimized` per immagini Shopify CDN dove serve

### Stabilità mobile / percezione crash
- disattivato prefetch su varie card prodotto per alleggerire la navigazione mobile
- safe local storage wrapper
- loading / error pages aggiunte
- reset stato prodotto migliorato quando cambia handle

### Contatti
- orari di apertura aggiornati
- orari in grassetto
- giorni leggermente più grandi

### Social preview / SEO
- metadata prodotto migliorati per preview WhatsApp
- anteprima prodotto usa immagine prodotto, titolo e descrizione dinamici

### Analytics
- lasciato attivo `@vercel/analytics`
- aggiunto supporto globale a:
  - Microsoft Clarity
  - GA4
  - Meta Pixel
- Clarity attivo e verificato
- GA4 installato e avviato lato pageview base
- Meta Pixel solo a livello codice/env, da verificare lato business manager

### Newsletter
- rimossa dal frontend la parte promo/discount legata alla newsletter
- backend base ancora presente, ma UI non più esposta

### AI / Ollama
- preparata route API per generare descrizioni usando:
  - titolo
  - descrizione
  - immagine prodotto
  - modello vision Ollama
- non ancora collegata a un pannello operativo

## 6. Decisioni progettuali prese

- **Non riscrivere il progetto da zero**
- mantenere l’identità visiva attuale: editoriale, calda, premium, non “template Shopify generico”
- evitare cambi radicali desktop se il desktop è già approvato visivamente
- fare modifiche mirate, soprattutto su mobile e conversione
- nella scheda prodotto tenere il contenuto essenziale e vero, non campi vuoti o inventati
- ritiro in store:
  - non più come form separato in scheda prodotto
  - sì come opzione del checkout Shopify
- newsletter:
  - niente UI sconto/lead magnet per ora
  - eventuale reintroduzione solo quando c’è un flusso email serio
- checkout preview:
  - mobile-first
  - summary prima
  - niente blocchi payment methods finti
  - un solo CTA chiaro verso Shopify
- filtri:
  - mobile compatti, chiusi di default
  - desktop da non peggiorare
- menu mobile:
  - `Sneakers` e `Accessori` fuori da `Abbigliamento`
- `SOLD OUT` deve essere molto visibile
- evitare modifiche non richieste ai flussi già stabilizzati
- per il traffico reale del sito dare più peso a **Clarity/GA4** che a Shopify sessioni standard

## 7. Problemi risolti

- checkout Shopify che andava in `404`
  - risolto con fix URL checkout lato [lib/shopify.ts](C:\Users\AndreaPistolesi\.gemini\antigravity\scratch\sixteenroad-storefront\lib\shopify.ts)
- immagini nuovi prodotti non visibili
  - risolto bypassando l’optimizer per immagini Shopify CDN
- schermate bianche/percezione crash mobile
  - mitigato con safe local storage, meno prefetch, loading/error fallback
- menu mobile e categorie incoerenti
  - riorganizzati livelli e sezioni
- filtri mobile troppo invadenti
  - chiusi di default e compattati
- footer sbilanciato e poco leggibile
  - ricostruito a 3 colonne
- prodotto troppo pieno di informazioni inutili/vuote
  - semplificato drasticamente
- doppio pulsante di chiusura nel popup immagine
  - lasciata una sola `X`
- preview social del sito generica / Vercel
  - metadata e icone sistemati lato sito
- Clarity non attivo
  - attivato tramite env e componente analytics
- GA4 non visibile all’inizio
  - installazione verificata; i dati hanno iniziato ad apparire lato realtime

## 8. Problemi ancora aperti

1. **Checkout Shopify: click sul logo**
- il logo checkout ora può essere aggiornato, ma il click può ancora portare al vecchio storefront Shopify
- causa: `sixteenroad.myshopify.com` è ancora il dominio principale connesso lato Shopify

2. **Vecchio storefront Shopify**
- non è ancora stato implementato un redirect della home del vecchio storefront verso il nuovo sito
- possibile soluzione già discussa: edit del tema Shopify vecchio in `theme.liquid`

3. **GA4 ecommerce**
- pageview base attivo
- non sono ancora implementati in modo completo:
  - `view_item`
  - `add_to_cart`
  - `begin_checkout`
  - `purchase`
- `purchase` andrà probabilmente completato lato Shopify checkout / custom pixel

4. **Meta Pixel**
- supportato nel codice
- va verificato lato Meta Events Manager e testato davvero

5. **Gift card**
- in passato c’è stata confusione tra:
  - `buono-regalo`
  - `buono-regalo-sixteenroad`
- verificare il prodotto gift card corretto, il handle e i tagli disponibili
- se la pagina gift card mostra “nessun prodotto trovato”, controllare subito `SHOPIFY_GIFT_CARD_PRODUCT_HANDLE`

6. **Ollama / AI descrizioni**
- route pronta
- manca UI o workflow operativo
- manca salvataggio automatico su Shopify/metafield

7. **Google favicon/logo in SERP**
- lato sito la base è stata sistemata
- Google può ancora mostrare per un po’ il vecchio favicon in cache

## 9. Prossimi task consigliati

1. **Sistemare definitivamente il comportamento del logo nel checkout Shopify**
- aggiornare branding logo
- decidere se fare redirect del vecchio storefront Shopify alla home nuova

2. **Verificare e stabilizzare gift card**
- confermare il prodotto gift card corretto
- confermare handle env
- verificare che tutti i tagli desiderati compaiano davvero nel builder

3. **Completare analytics ecommerce**
- su frontend:
  - `view_item`
  - `add_to_cart`
  - `begin_checkout`
- su Shopify checkout:
  - `purchase`

4. **Verificare Meta Pixel**
- test pageview
- test events base

5. **Rifinire UX mobile reale guardando Clarity**
- registrazioni
- dead click
- rage click
- punti di abbandono tra prodotto, taglia e checkout

6. **Collegare davvero Ollama a un flusso utile**
- generazione descrizione da titolo + descrizione + immagine
- eventualmente salvataggio in metafield Shopify

7. **QA finale checkout / pickup / cart**
- carrello
- checkout
- ritiro in store
- mobile e desktop

## 10. Regole per il nuovo thread Codex

- non riscrivere il progetto da zero
- mantenere lo stile visivo già definito
- fare modifiche mirate e progressive
- leggere prima i file coinvolti
- spiegare sempre quali file verranno modificati prima di editarli
- evitare modifiche non richieste
- non peggiorare il desktop per sistemare il mobile
- rispettare le decisioni già prese su:
  - checkout minimal con un solo CTA
  - scheda prodotto pulita
  - filtri mobile compatti
  - ritiro in store solo nel checkout
  - niente UI newsletter per ora
  - `Sneakers` e `Accessori` fuori da `Abbigliamento` nel mobile
- se un cambiamento tocca Shopify checkout / domini / redirect, fermarsi un attimo e valutare l’impatto prima di proporlo come definitivo
- evitare refactor larghi se non necessari
- usare il repo attuale come fonte di verità, non la chat storica

## 11. Prompt iniziale da usare nel nuovo thread

```text
Sto continuando il progetto Sixteen Road dal thread precedente.

Leggi prima il file:
PROJECT_HANDOFF.md

Regole:
- non riscrivere il progetto da zero
- mantieni lo stile attuale
- fai solo modifiche mirate
- prima di modificare qualcosa dimmi quali file toccherai
- evita cambiamenti non richiesti
- rispetta tutte le decisioni già documentate nel handoff

Parti dallo stato attuale del repo e usa PROJECT_HANDOFF.md come contesto principale.
```
