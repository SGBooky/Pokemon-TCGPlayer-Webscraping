/**
 * Get card info from https://www.tcgplayer.com/.
 * 
 *
 * @param {number} id The id number from the site. Found in URL after product/.
 */
function CARDGET(id) {
  const url = ("https://mpapi.tcgplayer.com/v2/product/"+id+"/details");
  const response = UrlFetchApp.fetch(url, {
    "method": "GET",
    "headers": {
      "Authorization": "Basic NzJkZjZiMTNlNzlkODA1MzAxODI1YzNmMzlhMDg0NzQ6c2hwcGFfZTJiZDZjOTVkZjVhZDhlY2E5Yjk3MDQyODYxZTFkOTA=",
      "Content-Type": "application/json"
    },
    "muteHttpExceptions": true,
    "followRedirects": true,
    "validateHttpsCertificates": true,
    "contentType": "application/json"
  });
 
  Logger.log("Response code is %s", response.getResponseCode());
  Logger.log(response.getContentText());
  Logger.log(("https://mpapi.tcgplayer.com/v2/product/"+id+"/details"));
    return response.getContentText();
}
