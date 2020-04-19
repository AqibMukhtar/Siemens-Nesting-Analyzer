const fs = require("fs"),
  path = require("path");

function scrap(filePath) {
  const html = fs.readFileSync(filePath).toString();
  let drawingNumbers = html
    .match(/<font size="2">[0-9_]{14}/g) // tags containing drawing numbers obtained. Output <font size="2">123_1234_1_1_1
    .map(tag => tag.match(/[0-9_]{12}/g)[0]); // drawing numbers are extracted, _1 after each drawing number is ignored, 1d array is obtained

  let occur = html
    .match(
      />NUMBER:&nbsp;[</>fontd]{12}<td valign="bottom"><font size="2">[1-9]&nbsp;/g
    )
    .toString()
    .match(/[01-99]&nbsp;/g)
    .toString()
    .match(/[01-99]/g)
    .map(occurence => Number(occurence));

  return {
    name: path.basename(filePath),
    location: path.join(__dirname, filePath),
    drawingNumbers,
    occur
  };
}

module.exports = { scrap };
