'use strict';

import { app, protocol } from 'electron';
import path = require('path');
import url = require('url');
let currentRenderer: any;
let currentViewData: any;
let currentOptions: any;
let currentViewsFolderPath: any;
let currentAssetFolderPath: any;

function parseFilePath(urlString: any) {
  const parsedUrl = new URL(urlString);
  let fileName = parsedUrl.pathname;
  if (process.platform === 'win32')
    fileName = fileName.substr(1);
  return fileName.replace(/(?:\s|%20)/g, ' ');
}

export function load(browserWindow: Electron.BrowserWindow, view: string, viewData: any, options: any) { // this would seem to be working
  currentViewData = viewData;
  currentOptions = options
  return browserWindow.loadURL(
    url.format({
      pathname: view,
      protocol: currentRenderer.name,
      query: {
        view
      },
      slashes: true,
    }),
  );
}

function setupView() {
  protocol.registerBufferProtocol(currentRenderer.name, (request, callback) => {
    const fileName = parseFilePath(request.url);
    renderTemplate(fileName).then((res: any) => callback(res));
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
      const extension = currentRenderer.extension || `.${currentRenderer.name}`;
      const filePath = path.join(currentViewsFolderPath, `${fileName}${extension}`);
      rendererAction(filePath, currentViewData, currentOptions, (renderedHTML: any) => {
        resolve({
          mimeType: 'text/html',
          data: Buffer.from(renderedHTML),
        });
      });
    } catch (error) {
      reject(error)
    }
  });
}

function rendererAction(filePath: string, viewData: string, options: any, callback: (data: string) => void) {
  currentViewData = undefined
  currentOptions = undefined
  currentRenderer.currentRenderFunction(filePath, viewData, options, (error: any, html: string) => {
    if (error)
      throw new Error(error)
    callback(html);
  });
}

export function use(renderer: any, useAssets: boolean, assetFolderPath: string, viewsFolderPath: string, renderFunction: any) {
  currentRenderer = renderer;
  currentRenderer.currentRenderFunction = renderFunction;
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
