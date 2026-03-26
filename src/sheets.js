import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

export async function run(names, prices, shippingCosts) {
  // This uses your gcloud login automatically
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();

  const sheets = google.sheets({
    version: "v4",
    auth: authClient,
  });

  const START_ROW = 91;

  function buildCellMap(column, values) {
    return values.map((value, index) => ({
      range: `Investments!${column}${START_ROW + index}`,
      value,
    }));
  }

  const cellMapPrices = buildCellMap("G", prices);
  const cellMapNames = buildCellMap("F", names);
  const cellMapShipping = buildCellMap("H", shippingCosts);

  async function writeCellMap(cellMapData, label) {
    for (const { range, value } of cellMapData) {
      if (value === undefined || value === null || value === "") {
        console.log(`Skipping ${range}: no ${label}`);
        continue;
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[value]],
        },
      });
    }
  }

  await writeCellMap(cellMapPrices, "price");
  await writeCellMap(cellMapNames, "name");
  await writeCellMap(cellMapShipping, "shipping cost");

  console.log("Write complete!");
}
