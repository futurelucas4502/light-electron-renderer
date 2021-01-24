# Light Electron Renderer Documentation

## Contents

* [Setup](#setup)
* [API](#api)
* [renderer.use()](#rendereruse)
* [renderer.permOpts()](#rendererpermopts)
* [renderer.permViewData()](#rendererpermviewdata)
* [renderer.load()](#rendererload)
* [Passing view data and options from the client side](#passingviewdataandoptionsfromtheclientside)

## Setup

`npm i @futurelucas4502/light-electron-renderer`

Then install your favourite templating language ([Compatability](https://github.com/futurelucas4502/light-electron-renderer#confirmed-working-with))

## API

The API is as follows:

In this example I assume you've required the renderer like so:

```js
const renderer = require('@futurelucas4502/light-electron-renderer')
```

### renderer.use()

```js
renderer.use(renderer, useAssets, assetFolderPath, viewsFolderPath, renderFunction, name, debug)
```

* `renderer` Library: The variable name of the templating engine you've chosen to use
* `useAssets` Bool: Whether or not to use Assets such as images, stylesheets, js etc etc
* `assetFolderPath` String: Path to your asset folder here to store your images, stylesheets, js etc etc
* `viewsFolderPath` String: Path to your views folder
* `renderFunction` String: Name of your templating engines render file function
* `name` String: The name of the templating language **NOTE:** This is only required if you get an error without setting it

### renderer.permOpts()

```js
renderer.permOpts({
  key: value  
})
```

This is used to set permanent options for the renderer/templating language this is required for some languages to use the import or including or partials like with squirrelly

* `permanentOptions` JSON: JSON data of options that will be added everytime a page is loaded

### renderer.permViewData()

```js
renderer.permViewData({
    key: value
})
```

This is used to set permanent view data for the renderer/templating language this may be something you want to do I have no idea?

* `permanentViewData` JSON: JSON data of view data that will be added everytime a page is loaded

### renderer.load()

```js
renderer.load(browserWindow, view, viewData, options)
```

* `browserWindow` Electron.BrowserWindow: The window you want the pages to be renderer on
* `view` String: Name of the file you want to render without the file extension
* `viewData` JSON: JSON data of all the view data you want to pass to that page
* `options` JSON: JSON data of all the options you want to pass to that page

### Passing view data and options from the client side

To do this you would simply type in the link address like normal and add a JSON array on the end like so:

```js
location.href = `ejs:///about{
    "viewData": {
        "msg": "About"
    },
    "viewOptions": {

    }
}`
```

or

```html
<a href='ejs:///about{
      "viewData": {
          "msg": "About"
      },
      "viewOptions": {

      }
  }'>link</a>
```