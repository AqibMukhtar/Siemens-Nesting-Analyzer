import {
  app,
  BrowserWindow,
  nativeTheme,
  dialog,
  ipcMain
} from "electron";
import path from 'path'

import findHTMLs from './Modules/findHTMLS'
import downloadHTMLS from "./Modules/downlaodHTMLS";
import uploadHTMLS from './Modules/uploadHTMLS';

const dbDir = path.join(__dirname, '..', '..', 'db', 'Nesting_Analyser.db')

try {
  if (
    process.platform === "win32" &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require("fs").unlinkSync(
      require("path").join(app.getPath("userData"), "DevTools Extensions")
    );
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require("path")
    .join(__dirname, "statics")
    .replace(/\\/g, "\\\\");
}

let mainWindow;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, 'electron-preload.js'),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("find-HTMLS", async (event, {
  drawingNumbers,
  occurences
}) => {
  try {
    let analyzedData = await findHTMLs(drawingNumbers, occurences, dbDir);
    console.log(JSON.stringify(analyzedData))
    event.returnValue = analyzedData;
  } catch (err) {
    throw err;
  }
});

ipcMain.on("download-HTMLS", async (event, htmlsName, downloadDir, fileName) => {
  const stats = await downloadHTMLS(event, htmlsName, downloadDir, dbDir, fileName)
  event.reply('update-downloading-status', stats)
});

ipcMain.on('open-download-dialog', async (event, defaultPath) => {
  let filePath = dialog.showSaveDialogSync(mainWindow, {
    title: 'Save All HTMLs',
    defaultPath,
    buttonLabel: 'Save HTML',
    filters: [{
      name: 'HTMLS',
      extensions: ['html', 'htm']
    }, {
      name: 'All Files',
      extensions: ['*']
    }],
    properties: ['createDirectory', 'showOverwriteConfirmation']
  });
  event.returnValue = filePath;
  // event.reply('get-download-path', saveOptions.filePath);
})

ipcMain.on('open-message-dialog', async (event, {
  type,
  buttons,
  title,
  message,
  detail
}) => {
  const clickedButton = dialog.showMessageBoxSync(mainWindow, {
    type,
    buttons,
    title,
    message,
    detail
  });
  event.returnValue = clickedButton;
})

ipcMain.on("upload-HTMLS", async (event, htmls) => {
  const stats = await uploadHTMLS(htmls, dbDir, event);
  event.reply("update-uploading-status", stats);
})