import { google } from "googleapis";
import { scrapeTCGPlayer } from "./scrape.js";

const SPREADSHEET_ID = "15_A4hHPzcQuyXic2lT1uqGv1hNBxFhkxMroVx3oQW0o";

export async function run(prices) {
  // This uses your gcloud login automatically
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();

  const sheets = google.sheets({
    version: "v4",
    auth: authClient,
  });

  // READ data
  // const readRes = await sheets.spreadsheets.values.get({
  //   spreadsheetId: SPREADSHEET_ID,
  //   range: "Investments!A1:X10",
  // });

  // console.log("Data:", readRes.data.values);

  const cellMap = [
    { range: "Investments!G5", price: prices[0] },
    { range: "Investments!G6", price: prices[1] },
  ];

  for (const { range, price } of cellMap) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [[price]],
      },
    });
  }

  console.log("Write complete!");
}
