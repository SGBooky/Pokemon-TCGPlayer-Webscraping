function fetchWebsiteData() {
  const url = 'https://www.tcgplayer.com/product/91146'; // Replace with your target URL
  try {
    const response = UrlFetchApp.fetch(url);
    //const htmlContent = response.getContentText();
    const javaScriptCode = response.getContentText();
    Logger.log(javaScriptCode);
    //Logger.log(htmlContent); // Logs the raw HTML content
  } catch (e) {
    Logger.log('Error fetching data: ' + e.toString());
    return null;
  }
}

function getExternalJavaScript() {
  const scriptUrl = 'https://example.com/path/to/your/script.js'; // Replace with the actual URL
  try {
    const response = UrlFetchApp.fetch(scriptUrl);
    const javaScriptCode = response.getContentText();
    Logger.log(javaScriptCode);
    // You can then use this code, for example, with the eval() function (use with caution)
    // eval(javaScriptCode); 
  } catch (e) {
    Logger.log('Error fetching script: ' + e.toString());
  }
}