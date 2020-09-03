# light-electron-renderer
A lightweight template view renderer for electron

Work in progress!

The goal of this project is to create a fully functional view renderer similair to that of express

The idea here is that you use this and parse the `require('some-templating-language')` into this as well as the name of the render function e.g. if it was ejs it would be `renderFile` hopefully that makes sense

You can install it using:

`npm i @futurelucas4502/light-electron-renderer`

Note: You **MUST** npm install whatever templating language your using

# Example usage with ejs:

## Folder structure:
```
project/
├── assets/
│   └── css/
│       └── main.css
├── views/
│   └── index.ejs
├── main.js
└── package.json
```

## main.js:
```js
// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const ejs = require('ejs')
const renderer = require('@futurelucas4502/light-electron-renderer')

// setup renderer
// renderer.use(your-renderer, using-assets?, foldername/path-to-assets, foldername/path-to-views, templating-engine-function-that-returns-html)
renderer.use(ejs, true, 'assets', 'views', 'renderFile')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })

  renderer.load(mainWindow, 'index', {
    msg: "Hello"
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
```

## views/index.ejs:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <link href="asset://css/main.css" rel="stylesheet"/>
    <title>Hello World!</title>
  </head>
  <body>
    <h1><%= msg %> World!</h1>
  </body>
</html>
```

## assets/css/main.css:
```css
body {
  background-color: lightblue;
}
```