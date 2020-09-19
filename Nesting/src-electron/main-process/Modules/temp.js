const fs = require('fs');
const path = require('path');

let downloadDir = "E:\\";
const stamp = new Date().toUTCString().toString().replace(/:/g, '-') + " - NESTING ANALYSER";
downloadDir = path.join(downloadDir, stamp);
if (!fs.existsSync(downloadDir))
    fs.mkdirSync(downloadDir);
// console.log(fs.existsSync(downloadDir));