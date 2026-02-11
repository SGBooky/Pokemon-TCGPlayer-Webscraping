import { chromium } from "playwright";
import fs from 'fs/promises';

export async function scrapeTCGPlayer() {
  const browser = await chromium.launch({
    headless: true   // set false to watch it work locally
  });

  const context = await browser.newContext();
  const cookiesString = await fs.readFile('cookies.json', 'utf8');
  const cookies = JSON.parse(cookiesString);
  await context.addCookies(cookies);

  const page = await context.newPage();
  //const page = await browser.newPage();

  await context.setExtraHTTPHeaders({
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
});

  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto(
    "https://www.tcgplayer.com/product/91146?Language=English&Condition=Near+Mint&page=1",
    { waitUntil: "networkidle" }
  );

  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  console.log("Snippet:", (await page.content()).slice(0, 500));

  // Wait for listings to appear
  await page.waitForSelector(".listing-item__listing-data__info__price", 
    { timeout: 50000 }
  );

  console.log(await page.content());

  // Extract all prices
  const prices = await page.$$eval(
    ".listing-item__listing-data__info__price",
    elements => elements.map(el => el.textContent.trim())
  );

  //console.log("Prices:", prices);

  await browser.close();

  return prices;
}