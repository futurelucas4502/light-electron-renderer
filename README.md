# light-electron-renderer
A lightweight template view renderer for electron

The goal of this project is to create a fully functional view renderer similair to that of express that can support: ejs, pug, haml, squirrelly and many other templating libraries

The idea here is that you use this and parse the `require('some-templating-language')` into this as well as the name of the render function e.g. if it was ejs it would be `renderFile` hopefully that makes sense if not take a look at the examples in the examples folder

You can install it using:

`npm i @futurelucas4502/light-electron-renderer`

Note: You **MUST** npm install whatever templating language your using

![Examples image](https://raw.githubusercontent.com/futurelucas4502/light-electron-renderer/master/assets/screenshot.png)

# Docs
[Documentation](https://futurelucas4502.github.io/docs/index.html?docs=light-electron-renderer)

# Guide
[Guide](https://futurelucas4502.medium.com/templating-in-electron-3302b9d7f6ac)

# Confirmed working with:

* Windows 10 x64 & ejs
* Windows 10 x64 & haml
* Windows 10 x64 & pug
* Windows 10 x64 & squirrelly
* Windows 10 x64 & eta
* Windows 10 x64 & handlebars

# Libraries that can work with this but still have problems:
* Twig (see [here](https://github.com/futurelucas4502/light-electron-renderer/issues/3) for more info)

# Libraries that will have support added in the future:
https://github.com/futurelucas4502/light-electron-renderer/projects/2
