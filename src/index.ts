'use strict';

import { app, protocol } from 'electron';
import path = require('path');
import url = require('url');
let currentRenderer: any;
let currentViewData: any;
let currentViewsFolderPath: any;
let currentAssetFolderPath: any;

function parseFilePath(urlString: any) {
  const parsedUrl = new URL(urlString);
  let fileName = parsedUrl.pathname;
  if (process.platform === 'win32') fileName = fileName.substr(1);
  return fileName.replace(/(?:\s|%20)/g, ' ');
}

export function load(browserWindow: Electron.BrowserWindow, view: string, viewData: any) { // this would seem to be working
  currentViewData = viewData;
  const query = {
    view
  }
  return browserWindow.loadURL(
    url.format({
      pathname: view,
      protocol: currentRenderer.name,
      query,
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
      rendererAction(filePath, currentViewData, (renderedHTML: any) => {
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

function rendererAction(filePath: string, viewData: string, callback: (data: string) => void) {
  currentRenderer.currentRenderFunction(filePath, viewData, {}, (error: any, html: string) => {
    // This line will probably error as i havent joined the renderer function name to the currentrenderer properly
    if (error) {
      throw new Error(error);
    }
    callback(html);
  });
}

export function use(renderer: any, useAssets: boolean, assetFolderPath: string, viewsFolderPath: string, renderFunction: any) {
  // main setup
  currentRenderer = renderer; // gets name of renderer
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
