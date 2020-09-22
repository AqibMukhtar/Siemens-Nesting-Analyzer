class HTML {
  constructor(
    inputDrawings = new Array(),
    relativeOccurence = new Array(),
    dataDir = new String(),
    db = new String()
  ) {
    Object.defineProperties(this, {
      inputDrawingNumbers: {
        value: inputDrawings,
        writable: false,
        configurable: false,
        enumerable: false
      },
      inputRelativeOccurence: {
        value: relativeOccurence,
        writable: false,
        configurable: false,
        enumerable: false
      },
      inputDataDir: {
        value: dataDir,
        writable: false,
        configurable: false,
        enumerable: false
      },
      DBReference: {
        value: db,
        writable: false,
        configurable: false,
        enumerable: false
      }
    });
    Object.defineProperties(this, {
      bestHTMLS: {
        value: new Array(),
        writable: true,
        configurable: false,
        enumerable: true
      },
      bestHTMLSOccurenceWise: {
        value: new Array(),
        writable: true,
        configurable: false,
        enumerable: true
      },
      foundDrawings: {
        value: new Array(),
        writable: true,
        configurable: false,
        enumerable: false
      },
      notFoundDrawings: {
        value: new Array(),
        writable: true,
        configurable: false,
        enumerable: false
      }
    });
    Object.defineProperty(this, "searchDrawingsInTables", {
      value: function () {
        let { foundDrawings, DBReference } = this,
          drawings = this.inputDrawingNumbers,
          currentTable = new Array(),
          tableIndex = -1,
          maxTables = DBReference.tablesLimit(this.inputDataDir);
        while (drawings.length != foundDrawings.length) {
          if (++tableIndex === maxTables) break;
          currentTable = DBReference.loadTable(tableIndex, dataDir);
          const limit = currentTable.length;
          for (let j = 0; j < drawings.length; j++) {
            const dn = drawings[j];
            let i = 0;
            while (i < limit) {
              if (currentTable[i].drawingNumber === dn) {
                foundDrawings.push(currentTable[i]);
                break;
              }
              i++;
            }
          }
        }
        this.notFoundDrawings = this.inputDrawingNumbers.filter(
          dn => !this.foundDrawings.map(fd => fd.drawingNumber).includes(dn)
        );
      },
      writable: false,
      enumerable: false
    });
  }

  getBestHTMLSNumberWise() {
    const extractHTMLS = () => {
      this.foundDrawings.forEach(drawing => {
        const { htmls } = drawing;
        this.bestHTMLS = this.bestHTMLS.concat(htmls);
      });
    };

    const removeRedundantHTMLS = () => {
      let { bestHTMLS } = this;
      for (let i = 0; i < bestHTMLS.length; i++) {
        let { name } = bestHTMLS[i];
        bestHTMLS = bestHTMLS.filter(
          ({ name: cname }, ci) => name != cname || i == ci
        );
      }
      this.bestHTMLS = bestHTMLS;
    };

    const mapDrawingsToHTMLS = () => {
      let { foundDrawings, bestHTMLS } = this;
      const bestHTMLLimit = bestHTMLS.length;
      bestHTMLS.forEach(h => {
        Object.defineProperties(h, {
          drawings: {
            value: new Array(),
            writable: true,
            enumerable: true
          },
          count: { value: new Number(0), writable: true, enumerable: true }
        });
      });
      foundDrawings.forEach(d => {
        d.htmls.forEach(({ name }) => {
          for (let i = 0; i < bestHTMLLimit; i++) {
            if (bestHTMLS[i].name === name) {
              bestHTMLS[i].drawings.push(d.drawingNumber);
              bestHTMLS[i].count++;
            }
          }
        });
      });
      this.bestHTMLS = bestHTMLS;
    };

    const findBestResults = () => {
      let { bestHTMLS } = this,
        servedHTMLS = [];
      while (bestHTMLS.length != 0) {
        const counts = bestHTMLS.map(h => h.count);
        const maxCount = Math.max(...counts);
        const index = counts.indexOf(maxCount);

        servedHTMLS = servedHTMLS.concat(
          JSON.parse(JSON.stringify(bestHTMLS[index]))
        );
        bestHTMLS[index].drawings.forEach(d =>
          bestHTMLS.forEach(({ drawings }, i) => {
            bestHTMLS[i].drawings = drawings.filter(cd => cd != d);
            bestHTMLS[i].count = bestHTMLS[i].drawings.length;
          })
        );
        bestHTMLS.splice(index, 1);
        bestHTMLS = bestHTMLS.filter(({ count }) => count > 0);
      }
      servedHTMLS.forEach(h => delete h.occur);
      this.bestHTMLS = servedHTMLS;
    };

    if (!this.foundDrawings.length) this.searchDrawingsInTables();
    extractHTMLS();
    removeRedundantHTMLS();
    mapDrawingsToHTMLS();
    findBestResults();
    return this.bestHTMLS;
  }

  getBestHTMLSPartOccurenceWise() {
    let arrangedData = [],
      selectedHTMLS = [];

    const arrangeData = () => {
      const {
        inputDrawingNumbers,
        inputRelativeOccurence,
        foundDrawings
      } = this;
      foundDrawings.forEach(({ drawingNumber, htmls }) =>
        arrangedData.push({
          drawingNumber,
          occur:
            inputRelativeOccurence[inputDrawingNumbers.indexOf(drawingNumber)],
          htmls
        })
      );
    };

    const selectPrioritizeHTMLS = () => {
      let prioritizedHTMLS = [];
      while (arrangedData.length) {
        let occurs = arrangedData.map(d => d.occur);
        const maxOccur = Math.max(...occurs);
        let index = occurs.indexOf(maxOccur);
        let relativeHtmls = arrangedData[index].htmls;
        let limit = relativeHtmls.length;
        prioritizedHTMLS.push({
          drawingNumber: arrangedData[index].drawingNumber,
          htmls: new Array()
        });
        for (let i = 0; i < limit; i++)
          if (relativeHtmls[i].occur === arrangedData[index].occur)
            prioritizedHTMLS[prioritizedHTMLS.length - 1].htmls.push(
              relativeHtmls[i]
            );
        if (!prioritizedHTMLS[prioritizedHTMLS.length - 1].htmls.length)
          prioritizedHTMLS[
            prioritizedHTMLS.length - 1
          ].htmls = prioritizedHTMLS[prioritizedHTMLS.length - 1].htmls.concat(
            relativeHtmls
          );
        arrangedData.splice(index, 1);
      }
      arrangedData = undefined;
      arrangedData = prioritizedHTMLS;
    };

    const extractHTMLS = () => {
      arrangedData.forEach(drawing => {
        let { htmls } = drawing;
        selectedHTMLS = selectedHTMLS.concat(htmls);
      });
      selectedHTMLS = selectedHTMLS.map(
        ({ name, location }) =>
          new Object({
            name,
            location,
            count: 0,
            drawings: new Array()
          })
      );
    };

    const removeRedundantHTMLS = () => {
      for (let i = 0; i < selectedHTMLS.length; i++) {
        const { name } = selectedHTMLS[i];
        selectedHTMLS = selectedHTMLS.filter(
          ({ name: cname }, ci) => name != cname || i == ci
        );
      }
    };

    const mapDrawingsToHTMLS = () => {
      selectedHTMLS.forEach(sh => {
        arrangedData.forEach(({ drawingNumber, htmls }) => {
          let htmlNames = htmls.map(({ name: hname }) => hname);
          if (htmlNames.includes(sh.name)) {
            let index = htmlNames.indexOf(sh.name);
            sh.drawings.push({
              drawingNumber,
              occur: htmls[index].occur
            });
            sh.count++;
          }
        });
      });
    };

    const findBestResults = () => {
      arrangedData = [];
      while (selectedHTMLS.length) {
        const counts = selectedHTMLS.map(({ count }) => count),
          index = counts.indexOf(Math.max(...counts)),
          length = arrangedData.push(selectedHTMLS[index]);
        let i = 0;
        selectedHTMLS.splice(index, 1);
        while (i < selectedHTMLS.length) {
          /*let drawings = selectedHTMLS[i].drawings.map(
              ({ drawingNumber }) => drawingNumber
            );
            arrangedData[length - 1].drawings.forEach(({ drawingNumber: cd }) => {
              if (drawings.includes(cd)) {
                const indexInOriginal = drawings.indexOf(cd);
                drawings.splice(indexInOriginal, 1);
              }
            });*/
          let drawings = selectedHTMLS[i].drawings;
          const drawingNumbers = drawings.map(
            ({ drawingNumber }) => drawingNumber
          );
          arrangedData[length - 1].drawings.forEach(drawing => {
            const { drawingNumber: cd, occur: co } = drawing;
            if (drawingNumbers.includes(cd)) {
              const indexInOriginal = drawingNumbers.indexOf(cd),
                occur = drawings[indexInOriginal].occur;
              if (occur == co) drawings.splice(indexInOriginal, 1);
            }
          });
          selectedHTMLS[i].drawings = drawings;
          if (!drawings.length) selectedHTMLS.splice(i, 1);
          else i++;
        }
      }
    };

    if (!this.foundDrawings.length) this.searchDrawingsInTables();
    arrangeData();
    selectPrioritizeHTMLS();
    extractHTMLS();
    removeRedundantHTMLS();
    mapDrawingsToHTMLS();
    findBestResults();
    this.bestHTMLSOccurenceWise = arrangedData;
    return this.bestHTMLSOccurenceWise;
  }

  getAllResults() {
    this.getBestHTMLSNumberWise();
    this.getBestHTMLSPartOccurenceWise();
    const {
      foundDrawings,
      notFoundDrawings,
      bestHTMLS,
      bestHTMLSOccurenceWise
    } = this;
    return {
      "Drawings found in HTMLs": foundDrawings.map(fd => fd.drawingNumber),
      "Drawings not found in HTMLs": notFoundDrawings,
      "Best Matches": bestHTMLS,
      "Best Matches (Part occurence wise)": bestHTMLSOccurenceWise
    };
  }
}

module.exports = HTML;
