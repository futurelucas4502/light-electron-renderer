# light-electron-renderer
A lightweight template view renderer for electron

Work in progress!

The goal of this project is to create a fully functional view renderer similair to that of express that can support: ejs, pug, haml and many other templating libraries

The idea here is that you use this and parse the `require('some-templating-language')` into this as well as the name of the render function e.g. if it was ejs it would be `renderFile` hopefully that makes sense if not take a look at the examples in the examples folder

You wil be able to install it using:

`npm i @futurelucas4502/light-electron-renderer`
**HOWEVER** it has not yet been released and therefore follow these instructions:

1. Clone or download the repo (and unzip)
2. Change into the project you want to use this in
3. Run `npm i "C:/path/to/downloaded/repo"`
4. See the examples for how to
5. Enjoy!

Note: You **MUST** npm install whatever templating language your using

# Confirmed working with:

* Windows 10 x64 & ejs
* Windows 10 x64 & haml
* Windows 10 x64 & pug