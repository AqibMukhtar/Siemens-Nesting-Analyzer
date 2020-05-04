const fs = require("fs"),
  path = require("path");

function scrap(filePath) {
  try {
    const html = fs
      .readFileSync(filePath)
      .toString()
      .replace(/[\n\r]+/g, "")
      .replace(/[ ]{2,}/g, "")
      .replace(/<!--[^>]*-->/g, "")
      .replace(/<!--[ \d\w<>="-;/.\]\[]*-->/g, "")
      .replace(/<!--<ZEITSTUDIE>[ \n<>/\w\d:.\\!(),'-]*-->/g, "");

    let drawingNumbers = html
      .match(/\d{3}_\d{4}_\d_\d+_\d+&nbsp;/g)
      .map(drawingNumber => drawingNumber.replace(/_[\d]+&nbsp;/g, ""));

    let occur = html
      .match(
        /<tr><td valign="bottom"><font size="2">NUMBER:&nbsp;<\/font><\/td><td valign="bottom"><font size="2">\d+&nbsp;<\/font><\/td><\/tr>/g
      )
      .join()
      .match(/\d+&nbsp;/g)
      .map(o => Number(o.replace(/\&nbsp;/g, "")));

    return {
      name: path.basename(filePath),
      location: path.join(__dirname, filePath),
      content: html,
      drawingNumbers,
      occur
    };
  } catch (err) {
    throw new Error(
      `Unable to scrap given file. Try to give file with proper formatting\nDetails:\n${err}`
    );
  }
}

module.exports = { scrap };
