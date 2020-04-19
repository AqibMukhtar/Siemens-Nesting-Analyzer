const fs = require("fs"),
  maxLengthOfTable = 10,
  totalPartNumberPossibilities = 1000000000,
  maxTableIndexes = totalPartNumberPossibilities / maxLengthOfTable;

function updateDB(htmlInfo = new Object(), dataDir = new String()) {
  let { name, location, drawingNumbers, occur } = htmlInfo,
    tableIndex = -1,
    maxTables = tablesLimit(dataDir),
    currentTable;
  while (drawingNumbers.length) {
    if (++tableIndex === maxTables) break;
    currentTable = loadTable(tableIndex, dataDir);
    const currentTableDrawings = currentTable.map(o => o.drawingNumber);
    const totalDrawings = drawingNumbers.length;
    let indexInDrawings = 0,
      isChange = false;
    for (let i = 0; i < totalDrawings; i++) {
      const index = currentTableDrawings.indexOf(
        drawingNumbers[indexInDrawings]
      );
      if (index !== -1) {
        isChange = true;
        currentTable[index].htmls.push({
          name,
          location,
          occur: occur[indexInDrawings]
        }); //yahan
        drawingNumbers.splice(indexInDrawings, 1);
        occur.splice(indexInDrawings, 1);
        continue;
      }
      indexInDrawings++;
    }
    if (isChange) writeTable(tableIndex, currentTable, dataDir);
  } // This will execute to update drawings
  // Those drawings are left which were not previously made. Push them into table. If current table has enough sapce then push into it, otherwise select next one
  tableIndex--;
  while (drawingNumbers.length) {
    while (currentTable.length < maxLengthOfTable && drawingNumbers.length) {
      currentTable.push({
        drawingNumber: drawingNumbers[0],
        htmls: [{ name, location, occur: occur[0] }] // yahan
      });
      drawingNumbers.splice(0, 1);
      occur.splice(0, 1);
    }
    writeTable(tableIndex, currentTable, dataDir);
    if (drawingNumbers.length) {
      tableIndex++;
      createTable(tableIndex, dataDir);
      currentTable = loadTable(tableIndex, dataDir);
    }
  } // This will execute to insert drawings
}

function loadTable(index, dataDir) {
  if (!isNaN(index) && index >= 0 && index <= maxTableIndexes - 1) {
    const path = `${dataDir}/table${index}.json`;
    return require(path);
  }
}

function writeTable(index, table, dataDir) {
  if (!isNaN(index) && index >= 0 && index <= maxTableIndexes - 1) {
    const path = `${dataDir}/table${index}.json`;
    table = JSON.stringify(table);
    fs.writeFile(path, table, () => console.log("Write successfully"));
  }
}

function createTable(index, dataDir) {
  if (!isNaN(index) && index >= 0 && index <= maxTableIndexes - 1) {
    const path = `${dataDir}/table${index}.json`;
    fs.writeFileSync(path, JSON.stringify([]));
  }
}

function tablesLimit(dir) {
  return fs.readdirSync(dir).length;
}

module.exports = {
  updateDB,
  loadTable,
  writeTable,
  createTable,
  tablesLimit
};
