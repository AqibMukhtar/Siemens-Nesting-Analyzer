const HTML = require("./HTMLClass"),
  CSV = require("./CSVClass"),
  scraper = require("./scraper"),
  database = require("./database");
// Importing necessary modules

const dataDir = "./Data",
  csvFilePath = "../Order_CSVs/KE.csv",
  htmlFilePath = "../Htmls/Ibrahim-2mm-5-200.html";
// Important files paths

// Showcase for scraping results
const scrappedResults = scraper.scrap(htmlFilePath);

// Showase for update database from scrapped results
database.updateDB(scrappedResults, dataDir);

// Showcase for CSV extraction and HTML search
let csv = new CSV(csvFilePath),
  header = csv.setHeaderAsProperties(false, true),
  drawingNumbers = header["Mat-No"],
  occurences = header["Sum-of-Qty"].map(value => Number(value));
let html = new HTML(drawingNumbers, occurences, dataDir, database);
console.log(html.getBestHTMLSNumberWise());
console.log(html.getBestHTMLSPartOccurenceWise());
