import { scrapeTCGPlayer } from "./scrape.js";
import { writeToSheet } from "./sheets.js";

async function main() {
  console.log("Starting scrape...");

  const prices = await scrapeTCGPlayer();

  console.log(`Found ${prices.length} prices`);

  await writeToSheet(prices);

  console.log("Sheet updated successfully");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});