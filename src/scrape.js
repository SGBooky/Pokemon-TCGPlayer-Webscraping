import { chromium } from "playwright";
import fs from 'fs/promises';

export async function scrapeTCGPlayer() {
  const browser = await chromium.launch({
    headless: false,   // set false to watch it work locally
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled'
  ]
  });

  const context = await browser.newContext();

  await context.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  });

  const cookiesString = await fs.readFile('cookies.json', 'utf8');
  const rawCookies = JSON.parse(cookiesString);
  const cookies = rawCookies.map(({ sameSite, ...rest }) => rest);

  await context.addCookies(cookies);

  const page = await context.newPage();

  await page.setViewportSize({ width: 1280, height: 800 });

  const allPrices = [];
  const allShippingCosts = [];

  const urlPages = [
    "https://www.tcgplayer.com/product/242819/pokemon-celebrations-celebrations-mini-tin-alola?xid=pia5d6b29a-2024-474d-8850-88d072dfec3d&Language=English&page=1",
    "https://www.tcgplayer.com/product/236377/pokemon-swsh05-battle-styles-v-strikers-tin-tyranitar-v?Language=English&page=1&ListingType=standard",
    "https://www.tcgplayer.com/product/220310/pokemon-miscellaneous-cards-and-products-v-powers-tin-eevee-v?page=1&Language=English",
    "https://www.tcgplayer.com/product/220308/pokemon-miscellaneous-cards-and-products-v-powers-tin-pikachu-v?Language=English&page=1",
    "https://www.tcgplayer.com/product/220311/pokemon-miscellaneous-cards-and-products-v-powers-tin-eternatus-v?Language=English&page=1",
    "https://www.tcgplayer.com/product/245143/Pokemon-SWSH04%20Vivid%20Voltage-Vivid%20Voltage%20Sleeved%20Booster%20Pack?xid=a29ef3824-098a-4104-9d9e-1356230903a2&Language=English",
    "https://www.tcgplayer.com/product/257320/Pokemon-SWSH03%20Darkness%20Ablaze-Darkness%20Ablaze%20Sleeved%20Booster%20Pack?xid=a7979d400-dd7f-4a08-ba50-b14496009624&Language=English",
    "https://www.tcgplayer.com/product/256125/Pokemon-SWSH09%20Brilliant%20Stars-Brilliant%20Stars%20Sleeved%20Booster%20Pack?xid=a03827f9a-25db-41de-ba04-a79e82b61c30&Language=English",
    "https://www.tcgplayer.com/product/616825/Pokemon-SM%20Guardians%20Rising-Guardians%20Rising%20Sleeved%20Booster%20Pack?xid=a27d33776-5dc3-4b5f-9c86-c19ef40b1ac0&Language=English",
    "https://www.tcgplayer.com/product/257718/pokemon-miscellaneous-cards-and-products-poke-ball-tin-display-q4-2021?Language=English&page=1",
    "https://www.tcgplayer.com/product/514256/pokemon-miscellaneous-cards-and-products-pokemon-collectors-chest-plus-pencil-case?page=1&Language=English",
    "https://www.tcgplayer.com/product/532539/pokemon-miscellaneous-cards-and-products-sinnoh-stars-mini-tins-5-pack?srsltid=AfmBOopV95h039-bOZC9zqGU_R-RbVnABFU8ZcI2NfYgrU6D8IN3OEFz&Language=all",
    "https://www.tcgplayer.com/product/282401/pokemon-swsh11-lost-origin-sword-and-shield-ultra-premium-collection-charizard?xid=pi85d29ad1-5d54-42e6-b6aa-4677b0f263de&page=1&Language=English",
    "https://www.tcgplayer.com/product/242820/pokemon-celebrations-celebrations-mini-tin-galar?xid=pi3b076d09-3032-448e-b889-a2ef08e54c7c&Language=English&page=1",
    "https://www.tcgplayer.com/product/242809/pokemon-celebrations-celebrations-collection-dark-sylveon-v?Language=English",
    
  ];

  for (const url of urlPages) {
    await page.goto(url, { waitUntil: "networkidle" });

    // Some items may have no active listings; skip those pages.
    const hasPrice = await page
      .waitForSelector(".listing-item__listing-data__info__price", { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (!hasPrice) {
      console.log("No price found, skipping:", url);
      allPrices.push(null);
      allShippingCosts.push(null);
      continue;
    }

    const firstListingData = await page.$eval(".listing-item", (listing) => {
      const normalizeShipping = (rawText) => {
        if (!rawText) return null;

        const text = rawText.replace(/\s+/g, " ").trim();

        if (/shipping\s*:?\s*included/i.test(text) || /free\s+shipping/i.test(text)) {
          return 0;
        }

        const plusAmount = text.match(/\+\s*(\$\d+(?:\.\d{2})?)\s*shipping/i);
        if (plusAmount) {
          return plusAmount[1];
        }

        const plainAmount = text.match(/(\$\d+(?:\.\d{2})?)\s*shipping/i);
        if (plainAmount) {
          return plainAmount[1];
        }

        return null;
      };

      const price = listing
        .querySelector(".listing-item__listing-data__info__price")
        ?.textContent
        ?.trim() || null;

      const shippingSelectorCandidates = [
        ".listing-item__listing-data__info__shipping",
        "[class*='shipping']",
        "[data-testid*='shipping']",
      ];

      let shippingText = null;
      for (const selector of shippingSelectorCandidates) {
        const el = listing.querySelector(selector);
        const value = el?.textContent?.trim();
        if (value) {
          shippingText = value;
          break;
        }
      }

      if (!shippingText) {
        shippingText = listing.textContent || "";
      }

      return {
        price,
        shippingCost: normalizeShipping(shippingText),
      };
    }).catch(() => ({ price: null, shippingCost: null }));

    //console.log("Prices:", prices);
    // allPrices.push(...prices);

    // prices.forEach(price => {
    //   console.log(price);
    // });

    const firstPrice = firstListingData.price;
    const firstShippingCost = firstListingData.shippingCost;
    if (!firstPrice) {
      console.log("No price found, skipping:", url);
      allPrices.push(null);
      allShippingCosts.push(firstShippingCost);
      continue;
    }

    console.log("Price:", firstPrice);
    console.log("Shipping:", firstShippingCost);
    allPrices.push(firstPrice);
    allShippingCosts.push(firstShippingCost);

  }

  await browser.close();

  return {
    prices: allPrices,
    shippingCosts: allShippingCosts,
  };

}