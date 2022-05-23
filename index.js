// include the Node.js 'path' module at the top of your file
const path = require('path')
const config = require('./config.json');
const { app, BrowserWindow } = require('electron');

//app.commandLine.appendSwitch('ignore-certificate-errors')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if(config) win.loadURL(config.url || 'localhost');
  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

try {
  require('electron-reloader')(module)
} catch (_) {}
