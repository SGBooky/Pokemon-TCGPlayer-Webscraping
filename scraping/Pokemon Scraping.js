/**
 * Gets TCGplayer prices using the current pricing endpoint
 * @param {number} productId TCGplayer product ID
 * @return {string[][]}
 * @customfunction
 */
function GET_TCGPLAYER_PRICES_BY_ID(productId) {
  const url = `https://www.tcgplayer.com/product/${productId}`;
  /**
   * https://www.tcgplayer.com/product/91146/pokemon-xy-flashfire-m-charizard-ex-y?page=1&Language=English&Condition=Lightly+Played
   */


  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  });

  if (response.getResponseCode() !== 200) {
    return [[`HTTP Error ${response.getResponseCode()}`]];
  }

  const data = JSON.parse(response.getContentText());

  if (!data || !data.results || data.results.length === 0) {
    return [["No prices found"]];
  }

  const output = [["Condition", "Low", "Market", "Mid", "High"]];

  data.results.forEach(item => {
    output.push([
      item.condition,
      item.lowPrice ?? "",
      item.marketPrice ?? "",
      item.midPrice ?? "",
      item.highPrice ?? ""
    ]);
  });

  return output;
}