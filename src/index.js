import { run } from "./sheets.js";
import { scrapeTCGPlayer } from "./scrape.js";

async function main() {

  console.log("Starting scrape...");

  const prices = await scrapeTCGPlayer();

  //console.log(`Found ${prices} prices`);

  console.log("Updating Google Sheet...");
  await run(prices);

  console.log("Sheet updated successfully");
  
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});