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

function createTable(db) {
  const query = `CREATE TABLE drawingTable (id INTEGER PRIMARY KEY,
      drawingNumber TEXT, name TEXT, location TEXT, occur INTEGER)`;
  return new Promise((res, rej) => {
    db.run(query, err => {
      if (err) rej(err);
      res("Table created");
    });
  });
}

function updateDB(db, htmlInfo) {
  const { drawingNumbers, name, location, occur } = htmlInfo;
  let promises = [];

  drawingNumbers.forEach((drawingNumber, i) => {
    const query = `INSERT INTO drawingTable (drawingNumber, name, location, occur) VALUES
       ("${drawingNumber}", "${name}", "${location}", ${occur[i]});`;

    const promise = new Promise((res, rej) => {
      db.run(query, err => {
        if (err) rej(err);
        res("Record Inserted");
      });
    });

    promises.push(promise);
  });

  return Promise.all(promises)
    .then(res => Promise.resolve("All records are inserted"))
    .catch(err => Promise.reject(err));
}

async function setUpDataBase(dbPath) {
  try {
    console.log("Make sure to delete any DataBase in", dbPath);
    console.log("Creating DataBase at", dbPath);
    let db = await new sqlite.Database(dbPath);
    console.log("Created and connected to DataBase...");
    console.log("Creating table drawingTable ...");
    console.log(await createTable(db));
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getDBInstance,
  retrieveData,
  updateDB,
  setUpDataBase
};
