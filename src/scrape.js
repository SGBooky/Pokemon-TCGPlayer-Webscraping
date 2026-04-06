import { chromium } from "playwright";
import fs from 'fs/promises';
import { urlPages } from "./pokemon-card-links.local.js";

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
  const allNames = [];

  for (const url of urlPages) {
    await page.goto(url, { waitUntil: "networkidle" });

    const pageName = await page.evaluate(() => {
      const selectors = [
        "h1",
        "[data-testid='product-details__name']",
        "[class*='product-details__name']",
        "[class*='product-name']",
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        const text = el?.textContent?.replace(/\s+/g, " ").trim();
        if (text) return text;
      }

      const title = document.title?.replace(/\s*-\s*TCGplayer.*$/i, "").trim();
      return title || null;
    });

    // Some items may have no active listings; skip those pages.
    const hasPrice = await page
      .waitForSelector(".listing-item__listing-data__info__price", { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (!hasPrice) {
      console.log("No price found, skipping:", url);
      allNames.push(pageName);
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
        const htmlDOMSearch = listing.querySelector(selector);
        const value = htmlDOMSearch?.textContent?.trim();
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

    const firstPrice = firstListingData.price;
    const firstShippingCost = firstListingData.shippingCost;

    if (!firstPrice) {
      console.log("No price found, skipping:", url);
      allNames.push(pageName);
      allPrices.push(null);
      allShippingCosts.push(firstShippingCost);
      continue;
    }

    console.log("Name:", pageName);
    console.log("Price:", firstPrice);
    console.log("Shipping:", firstShippingCost);
    allNames.push(pageName);
    allPrices.push(firstPrice);
    allShippingCosts.push(firstShippingCost);

  }

  await browser.close();

  return {
    names: allNames,
    prices: allPrices,
    shippingCosts: allShippingCosts,
  };

}