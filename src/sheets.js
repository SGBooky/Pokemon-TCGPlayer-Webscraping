import { google } from "googleapis";

const SPREADSHEET_ID = "15_A4hHPzcQuyXic2lT1uqGv1hNBxFhkxMroVx3oQW0o";
const RANGE = "V3";

export async function run() {
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

  // WRITE data
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Investments!S3",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["Pokemon", "Price", "Set"],
        ["Pikachu", "12.50", "Base"],
      ],
    },
  });

  console.log("Write complete!");
}

run().catch(console.error);
