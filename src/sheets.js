import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const START_ROW = Number(process.env.START_ROW || 2);
const BATCH_SIZE = Number(process.env.SHEETS_BATCH_SIZE || 25);
const BATCH_DELAY_MS = Number(process.env.SHEETS_BATCH_DELAY_MS || 400);
const MAX_RETRIES = Number(process.env.SHEETS_MAX_RETRIES || 5);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toRetryDelay(attempt) {
  const base = Math.min(2000, BATCH_DELAY_MS * (attempt + 1));
  const jitter = Math.floor(Math.random() * 150);
  return base + jitter;
}

function isRetriableError(error) {
  const status = error?.code || error?.response?.status;
  return status === 429 || status === 500 || status === 503;
}

async function withRetry(operation, label) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === MAX_RETRIES || !isRetriableError(error)) {
        throw error;
      }

      const waitMs = toRetryDelay(attempt);
      console.warn(
        `${label} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Retrying in ${waitMs}ms...`
      );
      await sleep(waitMs);
    }
  }
}

function normalizeValue(value) {
  return value === undefined || value === null ? "" : value;
}

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

  const rowCount = Math.max(names.length, prices.length, shippingCosts.length);
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    name: normalizeValue(names[index]),
    price: normalizeValue(prices[index]),
    shippingCost: normalizeValue(shippingCosts[index]),
  }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const firstRow = START_ROW + i;
    const lastRow = firstRow + chunk.length - 1;
    const nameRange = `Aspens $1204 Binder!D${firstRow}:D${lastRow}`;
    const priceRange = `Aspens $1204 Binder!H${firstRow}:H${lastRow}`;
    const shippingRange = `Aspens $1204 Binder!I${firstRow}:I${lastRow}`;

    await withRetry(
      () =>
        sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: "RAW",
            data: [
              {
                range: nameRange,
                values: chunk.map((row) => [row.name]),
              },
              {
                range: priceRange,
                values: chunk.map((row) => [row.price]),
              },
              {
                range: shippingRange,
                values: chunk.map((row) => [row.shippingCost]),
              },
            ],
          },
        }),
      `Sheet write for rows ${firstRow}-${lastRow}`
    );

    if (i + BATCH_SIZE < rows.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`Write complete! ${rows.length} rows written in batches of ${BATCH_SIZE}.`);
}
