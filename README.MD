# How to use the TCGPlayer Webscraper.
The purpose of this project is to be able to get any card from any condition from a tcgplayer link and being able to store the total cost which is price + shipping in a google sheet. This is bypassing the fact that TCGPlayer is a static webpage so using a function like **=IMPORTXML()** will only grab the cheapest cards on the webpage. 

# Make sure to have these installed
* npx playwright
* npm install googleapis
* npm install -g @google/clasp
* download google cloud console https://docs.cloud.google.com/sdk/docs/install-sdk
* then gcloud auth application-default login --scopes=https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/cloud-platform

# TO RUN 
* USE **npm start** in the src folder.