import { chromium } from "playwright";

export async function scrapeTCGPlayer() {
  const browser = await chromium.launch({
    headless: true   // set false to watch it work locally
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.tcgplayer.com/product/91146?Language=English&Condition=Near+Mint&page=1",
    { waitUntil: "networkidle" }
  );

  // Wait for listings to appear
  await page.waitForSelector(".listing-item__listing-data__info__price", 
    { timeout: 60000 }
  );

  // Extract all prices
  const prices = await page.$$eval(
    ".listing-item__listing-data__info__price",
    elements => elements.map(el => el.textContent.trim())
  );

  console.log("Prices:", prices);

  await browser.close();

  return prices;
}

scrapeTCGPlayer();