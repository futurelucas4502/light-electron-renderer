'use strict';

import { app, protocol } from 'electron';
import fs = require('fs');
import path = require('path');
import url = require('url');
let currentRenderer: any;
let currentRendererName: any;
let currentViewData: any;
let currentOptions: any;
let previousViewData: any;
let previousOptions: any;
let currentViewsFolderPath: any;
let currentAssetFolderPath: any;
let retry: boolean = false;
let permanentOpts: any;
let permanentVD: any;

function parseFilePath(urlString: any) {
  const parsedUrl = new URL(urlString);
  let fileName = parsedUrl.pathname;
  if (process.platform === 'win32')
    fileName = fileName.substr(1);
  return fileName.replace(/(?:\s|%20)/g, ' ');
}

export function load(browserWindow: Electron.BrowserWindow, view: string, viewData: any, options: any) {
  currentViewData = viewData;
  currentOptions = options;

  return browserWindow.loadURL(
    url.format({
      pathname: view,
      protocol: currentRendererName,
      slashes: true
    }),
  );
}

function setupView() {
  protocol.registerBufferProtocol(currentRendererName, (request, callback) => {
    if (request.headers.Accept === '*/*') { // fixes an error that occurs when you open devtools
      currentViewData = previousViewData;
      currentOptions = previousOptions;
    }
    const fileName = parseFilePath(request.url);
    renderTemplate(fileName).then((res: any) => {
      callback(res)
      currentViewData = undefined
      currentOptions = undefined
    }).catch(() => {
      retry = true
      renderTemplate(fileName).then((res: any) => {
        callback(res)
        currentViewData = undefined
        currentOptions = undefined
      }).catch((err) => {
        throw new Error(err)
      })
    })
    previousViewData = currentViewData
    previousOptions = currentOptions
  });
}

function setupAssets() {
  protocol.registerFileProtocol('asset', (request, callback) => {
    const hostName: any = url.parse(request.url).hostname;
    const fileName = parseFilePath(request.url);
    const filePath = path.join(currentAssetFolderPath, hostName, fileName);
    callback({ path: filePath });
  });
}

function renderTemplate(fileName: string) {
  return new Promise((resolve, reject) => {
    try {
      const extension = `.${currentRendererName}`;
      const filePath = path.join(currentViewsFolderPath, `${fileName}${extension}`);
      const options = currentOptions || new Object()
      const viewData = currentViewData || new Object()
      if (permanentOpts != undefined) {
        for (var item in permanentOpts) {
          options[item] = permanentOpts[item]
        }
      }
      if (permanentVD != undefined) {
        for (var item in permanentVD) {
          viewData[item] = permanentVD[item]
        }
      }
      rendererAction(filePath, viewData, options, (renderedHTML: any) => {
        try {
          resolve({
            mimeType: 'text/html',
            data: Buffer.from(renderedHTML),
          });
        } catch (error) {
          resolve({
            mimeType: 'text/html',
            data: Buffer.from(renderedHTML.contents.toString()),
          });
        }
      });
    } catch (error) {
      // console.log(error)
      reject(error)
    }
  });
}

function rendererAction(filePath: string, viewData: string, options: any, callback: (data: string) => void) {
  if (retry === false) {
    const html = currentRenderer.currentRenderFunction(fs.readFileSync(process.cwd() + "\\" + filePath, 'utf8'), viewData, options, (error: any, html1: any) => {
      if (error)
        throw new Error(error)
      try {
        html1.then((result: any) => {
          return result;
        }).then((htmlRes: any) => {
          callback(htmlRes);
        });
      } catch (error) {
        callback(html1);
      }
      return
    });
    try {
      html.then((result: any) => {
        return result;
      }).then((htmlRes: any) => {
        callback(htmlRes);
      });
    } catch (error) {
      callback(html);
    }
  } else {
    retry = false
    const html = currentRenderer.currentRenderFunction(filePath, viewData, options, (error: any, html1: any) => {
      if (error)
        throw new Error(error)
      try {
        html1.then((result: any) => {
          return result;
        }).then((htmlRes: any) => {
          callback(htmlRes);
        });
      } catch (error) {
        callback(html1);
      }
      return
    });
    try {
      html.then((result: any) => {
        return result
      }).then((htmlRes: any) => {
        callback(htmlRes);
      })
    } catch (error) {
      callback(html)
    }
  }
}

export function use(renderer: any, useAssets: boolean, assetFolderPath: string, viewsFolderPath: string, renderFunction: any, name: string) {
  currentRenderer = renderer;
  try {
    currentRendererName = currentRenderer.name.toLowerCase();
  } catch{
    if (name) {
      currentRendererName = name.toLowerCase();
    } else {
      throw new Error('This renderer doesn\'t have a default name assigned please pass it as the 6th parameter in the `.use` function.');
    }
  }
  if ('function' === typeof renderFunction) {
    currentRenderer.currentRenderFunction = renderFunction;
  } else {
    throw new Error('The 5th parameter in the `.use` function is not correct please correct it.');
  }
  app.whenReady().then(() => {
    if (typeof assetFolderPath === undefined || assetFolderPath === undefined || assetFolderPath == null)
      throw new Error('Views folder path must be provided!');
    currentViewsFolderPath = viewsFolderPath;
    setupView();
    if (useAssets) {
      if (typeof assetFolderPath === undefined || assetFolderPath === undefined || assetFolderPath == null)
        throw new Error('Assets folder path must be provided!');
      currentAssetFolderPath = assetFolderPath;
      setupAssets();
    }
  });
}


export function permOpts(permanentOptions: any){
  permanentOpts = permanentOptions
}

export function permViewData(permanentViewData: any){
  permanentVD = permanentViewData
}