import fs from 'fs'
import path from 'path'
import {
  getDBInstance,
  getHtmlByName
} from './database'

async function downloadHTMLS(event, htmlsName, downloadDir, dbDir, fileName) {
  let rate = {
    total: htmlsName.length,
    success: 0,
    failiour: 0
  }
  let db = await getDBInstance(dbDir);
  let promises = []

  htmlsName.forEach((name, i) => {
    let promise = new Promise(res => {
      getHtmlByName(db, name).then(response => {
        if (fileName.length <= 3) fileName = name.split('.')[0];
        else
          fileName = (i == 0) ? fileName : `${fileName}-${i}`

        const fileDir = `${downloadDir}\\${formatDate(Date.now())}`;
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir);
        }

        const filePath = path.join(fileDir, fileName + '.html');

        fs.writeFile(filePath, response, (err) => {
          if (err) {
            rate.failiour++;
            event.reply('update-downloading-status', {
              name,
              status: err,
              rate
            })
            res();
          } else {
            rate.success++;
            event.reply('update-downloading-status', {
              name,
              status: "Downlaod Complete",
              rate
            })
            res();
          }
        })
      }).catch(err => {
        rate.failiour++;
        event.reply('update-downloading-status', {
          name,
          status: err,
          rate
        })
        res();
      })
    })

    promises.push(promise)
  })
  return Promise.all(promises).then(() => {
    return {
      message: "All HTMLS are completed",
      complted: true,
      rate
    }
  })
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [day, month, year].join('-');
}

export default downloadHTMLS;
