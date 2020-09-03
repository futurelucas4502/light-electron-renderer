'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.use = exports.load = void 0;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var currentRenderer;
var currentViewData;
var currentOptions;
var currentViewsFolderPath;
var currentAssetFolderPath;
function parseFilePath(urlString) {
    var parsedUrl = new URL(urlString);
    var fileName = parsedUrl.pathname;
    if (process.platform === 'win32')
        fileName = fileName.substr(1);
    return fileName.replace(/(?:\s|%20)/g, ' ');
}
function load(browserWindow, view, viewData, options) {
    currentViewData = viewData;
    currentOptions = options;
    return browserWindow.loadURL(url.format({
        pathname: view,
        protocol: currentRenderer.name,
        query: {
            view: view
        },
        slashes: true,
    }));
}
exports.load = load;
function setupView() {
    electron_1.protocol.registerBufferProtocol(currentRenderer.name, function (request, callback) {
        var fileName = parseFilePath(request.url);
        renderTemplate(fileName).then(function (res) { return callback(res); });
    });
}
function setupAssets() {
    electron_1.protocol.registerFileProtocol('asset', function (request, callback) {
        var hostName = url.parse(request.url).hostname;
        var fileName = parseFilePath(request.url);
        var filePath = path.join(currentAssetFolderPath, hostName, fileName);
        callback({ path: filePath });
    });
}
function renderTemplate(fileName) {
    return new Promise(function (resolve, reject) {
        try {
            var extension = currentRenderer.extension || "." + currentRenderer.name;
            var filePath = path.join(currentViewsFolderPath, "" + fileName + extension);
            rendererAction(filePath, currentViewData, currentOptions, function (renderedHTML) {
                resolve({
                    mimeType: 'text/html',
                    data: Buffer.from(renderedHTML),
                });
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
function rendererAction(filePath, viewData, options, callback) {
    currentViewData = undefined;
    currentOptions = undefined;
    currentRenderer.currentRenderFunction(filePath, viewData, options, function (error, html) {
        if (error)
            throw new Error(error);
        callback(html);
    });
}
function use(renderer, useAssets, assetFolderPath, viewsFolderPath, renderFunction) {
    currentRenderer = renderer;
    currentRenderer.currentRenderFunction = renderFunction;
    electron_1.app.whenReady().then(function () {
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
exports.use = use;
