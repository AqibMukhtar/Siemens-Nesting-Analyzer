const {
  ipcRenderer
} = require('electron')
const fs = require('fs')

class CSV {
  constructor(path = new String()) {
    const readFile = () => {
      const parseCommaInData = a => {
        let safe = false;
        let output = "";
        for (let i = 0; i < a.length; i++) {
          if (a[i] == '"') safe = safe ? false : true;
          if (a[i] == "," && safe) output += "CommaToBeReplaced";
          else output += a[i];
        }
        return output;
      };
      let buffer;
      try {
        buffer = fs.readFileSync(this.path);
      } catch (err) {
        throw new Error(`Cannot load file. Details are given below\n${err}`);
      }
      this.rawData = parseCommaInData(buffer.toString());
      return this.rawData;
    };

    const generateRows = () => {
      let results,
        rows = [];
      this.rawData ? (results = this.rawData) : (results = readFile());
      while (results.length !== 0) {
        const endIndex = results.indexOf("\n");
        let portion = results.slice(0, endIndex);
        let row = portion.split(",");
        row.splice(row.length - 1, 1);
        const limit = row.length;
        for (let i = 0; i < limit; i++)
          row[i] = row[i]
          .trim()
          .replace(/^\"|\"$/g, "")
          .replace(/CommaToBeReplaced/g, ",");
        rows.push(row);
        results = results.replace(`${portion}\n`, "");
      }
      return rows;
    };

    const generateColumns = () => {
      let {
        rows
      } = this;
      let columns = [];
      for (let i = 0; i < rows[0].length; i++) {
        let cloumn = [];
        for (let j = 0; j < rows.length; j++) {
          cloumn.push(rows[j][i]);
        }
        columns.push(cloumn);
      }
      return columns;
    };

    const generateNetData = () => {
      let data = [];
      if (!this.columns.length) this.generateColumns();
      const {
        columns
      } = this;
      const limit = columns.length;
      for (let i = 0; i < limit; i++) {
        let singleData = {};
        singleData.head = columns[i][0];
        singleData.body = [];
        for (let j = 1; j < columns[i].length; j++) {
          singleData.body.push(columns[i][j]);
        }
        data.push(singleData);
      }
      return data;
    };

    Object.defineProperties(this, {
      path: {
        value: path,
        writable: false,
        configurable: false
      },

      rows: {
        get() {
          return generateRows();
        }
      },

      columns: {
        get() {
          return generateColumns();
        }
      },

      allData: {
        get() {
          return generateNetData();
        }
      },

      rawData: {
        value: undefined,
        writable: true,
        enumerable: false,
        configurable: false
      }
    });
  }
  setHeaderAsProperties(writable = new Boolean(), enumerable = new Boolean()) {
    let data = this.allData;
    data.forEach(col => {
      Object.defineProperty(this, col.head, {
        value: col.body,
        writable,
        enumerable
      });
    });
    return this;
  }
}

window.analyzeCSV = function (csvFilePath) {
  let csv = new CSV(csvFilePath),
    header = csv.setHeaderAsProperties(false, true),
    drawingNumbers = header["Mat-No"],
    occurences = header["Sum-of-Qty"].map(value => Number(value));
  return {
    drawingNumbers,
    occurences
  }
}

window.uploadCSV = function (csvContent) {
  return ipcRenderer.sendSync('find-HTMLS', csvContent)
}

window.downloadHTML = function (htmlsName, downlaodDir) {
  ipcRenderer.send('download-HTMLS', htmlsName, downlaodDir)
}

ipcRenderer.on('update-downloading-status', (event, statusUpdate) => {
  updateDownloadingStatus(statusUpdate)
})
