const sqlite = require("sqlite3").verbose();

async function getDBInstance(dbPath) {
  let db = await new sqlite.Database(dbPath);
  db.retrieveData = function (drawingNumbers) {
    const formulateIn = function () {
      let inValues = "";
      drawingNumbers.forEach(d => (inValues += `"${d}",`));
      inValues = inValues.slice(0, inValues.length - 1);
      return inValues;
    };

    const query = `SELECT drawingNumber, name, location, occur FROM drawingTable WHERE
      drawingNumber IN (${formulateIn()})`;

    return new Promise((res, rej) => {
      this.all(query, [], (err, rows) => {
        if (err) rej(err);
        res(rows);
      });
    });
  };
  return db;
}

function retrieveData(db, drawingNumbers) {
  const formulateIn = function () {
    let inValues = "";
    drawingNumbers.forEach(d => (inValues += `"${d}",`));
    inValues = inValues.slice(0, inValues.length - 1);
    return inValues;
  };

  const query = `SELECT drawingNumber, name, location, occur FROM drawingTable WHERE
    drawingNumber IN (${formulateIn()})`;

  return new Promise((res, rej) => {
    db.all(query, [], (err, rows) => {
      if (err) rej(err);
      res(rows);
    });
  });
}

function getHtmlByName(db, htmlName) {
  const query = `SELECT content FROM htmlContentTable WHERE name = "${htmlName}"`;
  return new Promise((res, rej) => {
    db.all(query, [], (err, rows) => {
      if (err) rej(err);
      res(decode(rows[0].content));
    });
  });
}

function createTables(db) {
  let promises = [];
  const queries = [
    `CREATE TABLE drawingTable (id INTEGER PRIMARY KEY, drawingNumber TEXT, name TEXT, location TEXT, occur INTEGER);`,
    `CREATE TABLE htmlContentTable (name TEXT PRIMARY KEY, content TEXT);`
  ];
  queries.forEach(query => {
    let promise = new Promise((res, rej) => {
      db.run(query, err => {
        if (err) rej(err);
        res(query);
      });
    });
    promises.push(promise);
  });

  return Promise.all(promises)
    .then(res => `All tables created successfully\n${res}`)
    .catch(err => `Could not create all tables\n${err}`);
}

function updateDB(db, htmlInfo) {
  const { drawingNumbers, name, location, occur, content } = htmlInfo;

  let updateHtmlContentTable = new Promise((res, rej) => {
    const query =
      `INSERT INTO htmlContentTable (name, content) VALUES ("${name}", ` +
      '"' +
      encode(content) +
      '" );';
    db.run(query, err => {
      if (err) rej(err);
      res("htmlContentTable Updated");
    });
  });

  return updateHtmlContentTable
    .then(res => {
      let promises = [];
      drawingNumbers.forEach((drawingNumber, i) => {
        const query = `INSERT INTO drawingTable (drawingNumber, name, location, occur) VALUES ("${drawingNumber}", "${name}", "${location}", ${occur[i]});`;

        const promise = new Promise((res, rej) => {
          db.run(query, err => {
            if (err) rej(err);
            res("Record Inserted into drawingTable");
          });
        });

        promises.push(promise);
      });

      return Promise.all(promises)
        .then(res =>
          Promise.resolve(`All records are inserted into drawingTable\n${res}`)
        )
        .catch(err => {
          throw new Error(
            `Unable to insert all records into drawingTable.\n${err}`
          );
        });
    })
    .catch(err => {
      throw new Error(
        `Cannot update htmlContentTable. May be you have used HTML with this name before.\nDetails: ${err}`
      );
    });
}

async function setUpDataBase(dbPath) {
  try {
    console.log("Make sure to delete any DataBase in", dbPath);
    console.log("Creating DataBase at", dbPath);
    let db = await new sqlite.Database(dbPath);
    console.log("Created and connected to DataBase...");
    console.log("Creating required tables...");
    console.log(await createTables(db));
  } catch (err) {
    throw `Error occured in setting up database\nDetails\n${err}`;
  }
}

function encode(htmlContent) {
  let encoded = "";
  const limit = htmlContent.length;
  for (let i = 0; i < limit; i++) {
    let hex = htmlContent.charCodeAt(i).toString(16);
    if (hex.length === 1) hex = "0" + hex;
    encoded += hex + ",";
  }
  encoded = encoded.slice(0, -1);

  return encoded;
}

function decode(encoded) {
  let hexCharValues = encoded.split(",").map(value => "0x" + value);
  return String.fromCharCode(...hexCharValues);
}

module.exports = {
  getDBInstance,
  retrieveData,
  getHtmlByName,
  updateDB,
  setUpDataBase
};
