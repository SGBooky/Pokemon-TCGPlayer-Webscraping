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
  const allNames = [];

  const urlPages = [
    // sealed products
    "https://www.tcgplayer.com/product/45133/pokemon-jungle-nidoqueen-7?Condition=Moderately+Played&Language=English&page=1",

    "https://www.tcgplayer.com/product/44422/pokemon-fossil-muk-13?Language=English&Condition=Moderately+Played&page=1",
    "https://www.tcgplayer.com/product/85673/pokemon-expedition-gengar-48?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/42417/pokemon-base-set-computer-search?srsltid=AfmBOopxbJtQLolm1tI_hPaCfrR6qgEN5i8N8P0osoQ6AIQVsyUbJRRy&Language=English&Condition=Moderately+Played&page=1",
    "https://www.tcgplayer.com/product/86744/pokemon-neo-destiny-light-machamp?srsltid=AfmBOopj4o73Li7gGFIDaZg7s7lcDIF5-uxQrx8wc1nniZswaihZm0a6&Language=English&Condition=Moderately+Played&page=1",
    "https://www.tcgplayer.com/product/87524/pokemon-gym-heroes-misty-102?Language=English&page=1&Condition=Moderately+Played",

    "https://www.tcgplayer.com/product/83538/pokemon-expedition-ampharos-2?Condition=Moderately+Played&Language=English&page=1&Printing=Holofoil",
    "https://www.tcgplayer.com/product/86737/Pokemon-Neo%20Destiny-Light%20Dragonair?xid=ad99a82ce-173c-416d-8ed0-774da8955431&Language=English&Condition=Moderately+Played&page=1",
    "https://www.tcgplayer.com/product/45163/pokemon-jungle-pikachu?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/88882/Pokemon-Gym%20Challenge-Sabrinas%20Kadabra?xid=a355e1077-d770-47a2-8112-d6df11ca7ff0&Language=English&Condition=Moderately+Played&page=1",
    "https://www.tcgplayer.com/product/85415/pokemon-expedition-feraligatr-46?Condition=Moderately+Played&Language=English&page=1",

    "https://www.tcgplayer.com/product/89007/pokemon-ruby-and-sapphire-scyther-ex?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/87394/pokemon-wotc-promo-mew-8?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/86649/pokemon-nintendo-promos-latias-014-pokemon-heroes-latios-and-latias-dvd-release?country=US&utm_campaign=20451986774&utm_source=google&utm_medium=cpc&utm_content=&utm_term=&adgroupid=&gad_source=1&gad_campaignid=20451985907&gbraid=0AAAAADHLWY3P2xQVXRV6Fki1gIWUd5WR8&gclid=CjwKCAjwspPOBhB9EiwATFbi5Bkl6myypi5aqkEke-iMWkRON4wfhvfNSNtHWVCwlObDf0MGIs8slhoCbiMQAvD_BwE&Language=English&Condition=Moderately+Played&page=1",

    "https://www.tcgplayer.com/product/85309/Pokemon-Gym%20Heroes-Erikas%20Vileplume?xid=a05cee1cb-9066-4705-861b-f97d502f467c&Language=English&Condition=Moderately+Played&page=1",
    "https://www.tcgplayer.com/product/45123/pokemon-jungle-vaporeon-12?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/87538/Pokemon-Gym%20Heroes-Mistys%20Poliwrath?xid=abbbc8c6b-8d7c-4419-acf2-ec2819e2ff0e&Language=English&Condition=Moderately+Played&page=1",

    "https://www.tcgplayer.com/product/84461/pokemon-dragon-crawdaunt-3-97?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/86101/pokemon-legendary-collection-hitmonlee?Language=English&page=1&Printing=Reverse+Holofoil&Condition=Lightly+Played",
    "https://www.tcgplayer.com/product/83628/pokemon-ruby-and-sapphire-aron-25-109?Printing=Reverse+Holofoil&Language=English&page=1&Condition=Moderately+Played",
    "https://www.tcgplayer.com/product/85412/pokemon-neo-genesis-feraligatr-4?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/89760/pokemon-expedition-tauros?Condition=Moderately+Played&Language=English&page=1&Printing=Reverse+Holofoil",
    "https://www.tcgplayer.com/product/85356/pokemon-aquapolis-exeggutor-13?Printing=Reverse+Holofoil&Language=English&page=1&Condition=Heavily+Played",

    "https://www.tcgplayer.com/product/84353/pokemon-expedition-clefairy?Printing=Reverse+Holofoil&Language=English&page=1&Condition=Moderately+Played",
    "https://www.tcgplayer.com/product/86873/pokemon-diamond-and-pearl-lucario?Printing=Reverse+Holofoil&Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/87388/pokemon-expedition-metapod?Printing=Reverse+Holofoil&Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/83755/pokemon-ruby-and-sapphire-beautifly?Language=English&page=1&Condition=Moderately+Played",
    "https://www.tcgplayer.com/product/83755/pokemon-ruby-and-sapphire-beautifly?Language=English&page=1&Condition=Moderately+Played",
    "https://www.tcgplayer.com/product/83755/pokemon-ruby-and-sapphire-beautifly?Language=English&page=1&Condition=Moderately+Played&Printing=Reverse+Holofoil",
    "https://www.tcgplayer.com/product/85632/pokemon-ruby-and-sapphire-gardevoir?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/220665/pokemon-burger-king-promos-shinx-98-130-diamond-and-pearl?Condition=Moderately+Played&Language=English&page=1",

    "https://www.tcgplayer.com/product/84204/pokemon-team-rocket-charmander?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/85887/pokemon-legendary-collection-graveler?Condition=Moderately+Played&Language=English&page=1&Printing=Reverse+Holofoil",
    "https://www.tcgplayer.com/product/45122/pokemon-jungle-snorlax-11?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/42408/pokemon-base-set-squirtle?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/87829/pokemon-aquapolis-octillery?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/84606/pokemon-team-rocket-dark-gyarados-8?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/89388/pokemon-firered-and-leafgreen-snorlax?Condition=Moderately+Played&Language=English&page=1&Printing=Reverse+Holofoil",

    "https://www.tcgplayer.com/product/87549/pokemon-gym-challenge-mistys-tears?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/85319/pokemon-sandstorm-espeon?Condition=Moderately+Played&Language=English&page=1",

    "https://www.tcgplayer.com/product/89872/pokemon-aquapolis-tentacruel?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/87054/pokemon-ruby-and-sapphire-magmar-ex?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/213008/pokemon-burger-king-promos-prinplup-58-130-diamond-and-pearl?Condition=Moderately+Played&Language=English&page=1",
    "https://www.tcgplayer.com/product/84172/pokemon-expedition-chansey?Language=English&page=1&Printing=Reverse+Holofoil",
    "https://www.tcgplayer.com/product/86785/pokemon-sandstorm-lileep-42-100?Printing=Reverse+Holofoil&Language=English&page=1&Condition=Moderately+Played",
    "https://www.tcgplayer.com/product/84909/pokemon-wotc-promo-dragonite-movie-promo?Condition=Moderately+Played&Language=English&page=1"
  ];

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