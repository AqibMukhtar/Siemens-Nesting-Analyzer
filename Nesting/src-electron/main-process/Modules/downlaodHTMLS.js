import fs from 'fs'
import path from 'path'
import { getDBInstance, getHtmlByName } from './database'

async function downloadHTMLS(event, htmlsName, downloadDir, dbDir) {
  let rate = { total: htmlsName.length, success: 0, failiour: 0 }
  let db = await getDBInstance(dbDir);
  let promises = []

  const stamp = new Date().toUTCString().replace(/:/g, '-') + " - NESTING ANALYSER";
  downloadDir = path.join(downloadDir, stamp);
  if (!fs.existsSync(downloadDir))
    fs.mkdirSync(downloadDir);

  htmlsName.forEach((name, i) => {
    let promise = new Promise(res => {
      getHtmlByName(db, name).then(response => {
        const fileDir = path.join(downloadDir, name + '.html')
        fs.writeFile(fileDir, response, (err) => {
          if (err) {
            rate.failiour++;
            event.reply('update-downloading-status', { name, status: err, rate })
            res();
          }
          else {
            rate.success++;
            event.reply('update-downloading-status', { name, status: "Downlaod Complete", rate })
            res();
          }
        })
      }).catch(err => {
        rate.failiour++;
        event.reply('update-downloading-status', { name, status: err, rate })
        res();
      })
    })

    promises.push(promise)
  })
  db.close();
  return Promise.all(promises).then(() => {
    return {
      message: "All HTMLS are completed",
      complted: true,
      rate
    }
  })
}


export default downloadHTMLS;