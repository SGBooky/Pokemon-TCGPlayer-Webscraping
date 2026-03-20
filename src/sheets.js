import { google } from "googleapis";

const SPREADSHEET_ID = "15_A4hHPzcQuyXic2lT1uqGv1hNBxFhkxMroVx3oQW0o";

export async function run(prices, shippingCosts) {
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

  const cellMap = [ // Map each price to a specific cell in the spreadsheet
    { range: "Investments!G2", price: prices[0] },
    { range: "Investments!G4", price: prices[1] },
    { range: "Investments!G5", price: prices[2] },
    { range: "Investments!G6", price: prices[3] },
    { range: "Investments!G7", price: prices[4] },
    { range: "Investments!G8", price: prices[5] },
    { range: "Investments!G9", price: prices[6] },
    { range: "Investments!G10", price: prices[7] },
    { range: "Investments!G11", price: prices[8] },
    { range: "Investments!G12", price: prices[9] },
    { range: "Investments!G13", price: prices[10] },
    { range: "Investments!G14", price: prices[11] },
    { range: "Investments!G15", price: prices[12] },
    { range: "Investments!G16", price: prices[13] },
    { range: "Investments!G18", price: prices[14] },




  ];

  const cellMapShipping = [ // Map each shipping cost to a specific cell in the spreadsheet
    { range: "Investments!H2", price: shippingCosts[0] },
    { range: "Investments!H4", price: shippingCosts[1] },
    { range: "Investments!H5", price: shippingCosts[2] },
    { range: "Investments!H6", price: shippingCosts[3] },
    { range: "Investments!H7", price: shippingCosts[4] },
    { range: "Investments!H8", price: shippingCosts[5] },
    { range: "Investments!H9", price: shippingCosts[6] },
    { range: "Investments!H10", price: shippingCosts[7] },
    { range: "Investments!H11", price: shippingCosts[8] },
    { range: "Investments!H12", price: shippingCosts[9] },
    { range: "Investments!H13", price: shippingCosts[10] },
    { range: "Investments!H14", price: shippingCosts[11] },
    { range: "Investments!H15", price: shippingCosts[12] },
    { range: "Investments!H16", price: shippingCosts[13] },
    { range: "Investments!H18", price: shippingCosts[14] },
  ];

  for (const { range, price } of cellMap) {
    if (price === undefined || price === null || price === "") {
      console.log(`Skipping ${range}: no price`);
      continue;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [[price]],
      },
    });
  }

  for (const { range, price } of cellMapShipping) {
    if (price === undefined || price === null || price === "") {
      console.log(`Skipping ${range}: no shipping cost`);
      continue;
    }

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
