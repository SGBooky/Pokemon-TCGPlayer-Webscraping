import { google } from "googleapis";

const SPREADSHEET_ID = "15_A4hHPzcQuyXic2lT1uqGv1hNBxFhkxMroVx3oQW0o";
const RANGE = "V3";

export async function writeToSheet(prices) {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const values = prices.map((price, index) => [
    index + 1,
    price,
  ]);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}