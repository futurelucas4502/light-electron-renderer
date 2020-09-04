'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.use = exports.load = void 0;
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var url = require("url");
var currentRenderer;
var currentRendererName;
var currentViewData;
var currentOptions;
var previousViewData;
var previousOptions;
var currentViewsFolderPath;
var currentAssetFolderPath;
var retry = false;
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
        protocol: currentRendererName,
        slashes: true
    }));
}
exports.load = load;
function setupView() {
    electron_1.protocol.registerBufferProtocol(currentRendererName, function (request, callback) {
        if (request.headers.Accept === '*/*') { // fixes an error that occurs when you open devtools
            currentViewData = previousViewData;
            currentOptions = previousOptions;
        }
        var fileName = parseFilePath(request.url);
        renderTemplate(fileName).then(function (res) {
            callback(res);
            currentViewData = undefined;
            currentOptions = undefined;
        }).catch(function () {
            retry = true;
            renderTemplate(fileName).then(function (res) {
                callback(res);
                currentViewData = undefined;
                currentOptions = undefined;
            }).catch(function (err) {
                throw new Error(err);
            });
        });
        previousViewData = currentViewData;
        previousOptions = currentOptions;
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
            var extension = "." + currentRendererName;
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
    if (retry === false) {
        var html = currentRenderer.currentRenderFunction(fs.readFileSync(process.cwd() + "\\" + filePath, 'utf8'), viewData, options, function (error, html1) {
            if (error)
                throw new Error(error);
            callback(html1);
            return;
        });
        callback(html);
    }
    else {
        retry = false;
        var html = currentRenderer.currentRenderFunction(filePath, viewData, options, function (error, html1) {
            if (error)
                throw new Error(error);
            callback(html1);
            return;
        });
        try {
            html.then(function (result) {
                return result;
            }).then(function (htmlRes) {
                callback(htmlRes);
            });
        }
        catch (error) {
            callback(html);
        }
    }
}
function use(renderer, useAssets, assetFolderPath, viewsFolderPath, renderFunction, name) {
    currentRenderer = renderer;
    try {
        currentRendererName = currentRenderer.name.toLowerCase();
    }
    catch (_a) {
        if (name) {
            currentRendererName = name.toLowerCase();
        }
        else {
            throw new Error('This renderer doesn\'t have a default name assigned please pass it as the 6th parameter in the `.use` function.');
        }
    }
    if ('function' === typeof renderFunction) {
        currentRenderer.currentRenderFunction = renderFunction;
    }
    else {
        throw new Error('The 5th parameter in the `.use` function is not correct please correct it.');
    }
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
