import { run } from "./sheets.js";
import { scrapeTCGPlayer } from "./scrape.js";

async function main() {

  console.log("Starting scrape...");

  const { prices, shippingCosts } = await scrapeTCGPlayer();

  //console.log("Shipping costs:", shippingCosts);

  //console.log(`Found ${prices} prices`);

  console.log("Updating Google Sheet...");
  await run(prices, shippingCosts);

  console.log("Sheet updated successfully");
  
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});