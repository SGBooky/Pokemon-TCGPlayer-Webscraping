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

  // await page.goto(
  //   "https://www.tcgplayer.com/product/91146?Language=English&Condition=Near+Mint&page=1",
  //   { waitUntil: "networkidle" }
  // );

  // await page.goto(
  //   "https://www.tcgplayer.com/product/42346/pokemon-base-set-alakazam?page=1&Language=English&Condition=Near+Mint",
  //   { waitUntil: "networkidle" }
  // );

  const urlPages = [
    "https://www.tcgplayer.com/product/236377/pokemon-swsh05-battle-styles-v-strikers-tin-tyranitar-v?Language=English&page=1",
    // "https://www.tcgplayer.com/product/42346/pokemon-base-set-alakazam?page=1&Language=English&Condition=Near+Mint",
    // "https://www.tcgplayer.com/product/91146?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/90113/pokemon-neo-discovery-tyranitar-12?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/241764/pokemon-swsh06-chilling-reign-weezing?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/241765/pokemon-swsh06-chilling-reign-crobat?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/241766/pokemon-swsh06-chilling-reign-sableye?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/241767/pokemon-swsh06-chilling-reign-gengar?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/241768/pokemon-swsh06-chilling-reign-mimikyu?Language=English&Condition=Near+Mint&page=1",
    // "https://www.tcgplayer.com/product/241769/pokemon-swsh06-chilling-reign-dusknoir?Language=English&Condition=Near+Mint&page=1",
  ];

  for (const url of urlPages) {
    await page.goto(url, { waitUntil: "networkidle" });

    // Wait for listings to appear
    await page.waitForSelector(".listing-item__listing-data__info__price", 
      { timeout: 10000 }
    );

    // Extract all prices
    const prices = await page.$$eval(
      ".listing-item__listing-data__info__price",
      elements => elements.map(element => element.textContent.trim())
    );

    // PRICES PRINTED HERE
    console.log("Prices:", prices);

  }

  await browser.close();

}