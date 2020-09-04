// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const Sqrl = require('squirrelly')
const renderer = require('@futurelucas4502/light-electron-renderer')

// setup renderer
renderer.use(Sqrl, true, 'assets', 'views', Sqrl.render, "squirrelly")

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  const head = (fs.readFileSync(path.join(__dirname, "views/partials/head.squirrelly"))).toString()// yes this is not pretty but it works
  Sqrl.templates.define("head", Sqrl.compile(head));

  renderer.load(mainWindow, 'index', {
    appName: app.getName(),
    appVersion: app.getVersion(),
    chromeVersion: process.versions['chrome'],
    nodeVersion: process.versions['node'],
    electronVersion: process.versions['electron']
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.