const HTML = require("./HTMLClass"),
  CSV = require("./CSVClass"),
  database = require("./database"),
  scraper = require("./scraper");
// Import necessary modules

async function execute() {
  try {
    const csvFilePath = "../Order_CSVs/KE.csv",
      htmlFilePath = "../Htmls/Ibrahim-2mm-5-200.html",
      dbDir = "./Data/Nesting_Analyser.db";
    // Data locations

    let csv = new CSV(csvFilePath),
      header = csv.setHeaderAsProperties(false, true),
      drawingNumbers = header["Mat-No"],
      occurences = header["Sum-of-Qty"].map(value => Number(value));
    // CSV file parsing and results extraction

    let db = await database.getDBInstance(dbDir);
    const scrappingResults = scraper.scrap(htmlFilePath);
    console.log(await database.updateDB(db, scrappingResults));
    // Obtaining scraping results and updating database with them

    let html = new HTML(drawingNumbers, occurences, db);
    console.log(await html.getBestHTMLSNumberWise());
    console.log(JSON.stringify(await html.getBestHTMLSPartOccurenceWise()));
    console.log(JSON.stringify(await html.getAllResults()));
    // Obtaining results of searching

    let htmlFromDB = await database.getHtmlByName(db, "Ibrahim-2mm-5-200.html");
    console.log(htmlFromDB);
    // Obtain html from database with name as key

    db.close();
  } catch (err) {
    console.log(`Error occured in execute\n${err}`);
  }
}
execute();

// database.setUpDataBase("./Data/Nesting_Analyser.db");
// Setup fresh new database
