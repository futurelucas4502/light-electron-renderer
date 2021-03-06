'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.permViewData = exports.permOpts = exports.use = exports.load = void 0;
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var url = require("url");
var currentRenderer;
var currentRendererName;
var currentViewData;
var currentOptions;
var previousViewData = {};
var previousOptions = {};
var currentViewsFolderPath;
var currentAssetFolderPath;
var retry = 0;
var permanentOpts;
var permanentVD;
var debugMode = false;
var vD = 'viewData';
var vO = 'viewOptions';
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
        slashes: true,
    }), {
        extraHeaders: 'clicked: true',
    });
}
exports.load = load;
function setupView() {
    electron_1.protocol.registerBufferProtocol(currentRendererName, function (request, callback) {
        var _a, _b;
        var fileName;
        if (request.url.includes('{')) {
            fileName = parseFilePath(request.url.split('{')[0]);
        }
        else {
            fileName = parseFilePath(request.url);
        }
        if (request.headers.Accept === '*/*' || !request.headers.hasOwnProperty('clicked')) {
            // fixes an error that occurs when you open devtools as dev tools loads the page again using the accept header as */* and then we check if our own custom header exists if it does well we know we should use the current data and not any previously stored data e.g. when we refresh we won't have the data sent again and we won't have the clicked header meaning we need to use the existing data stored in the previous data array
            currentViewData = previousViewData[fileName];
            currentOptions = previousOptions[fileName];
        }
        if (request.url.includes('{')) {
            // i have to do another check here after setting the filePath due to the fact if i was to set the currentViewData it could be overwritten if new data was passed through which we obviously don't want
            var data = JSON.parse(request.url.substring(request.url.indexOf('{')));
            currentViewData = Object.assign(currentViewData !== null && currentViewData !== void 0 ? currentViewData : '', (_a = data[vD]) !== null && _a !== void 0 ? _a : '');
            currentOptions = Object.assign(currentOptions !== null && currentOptions !== void 0 ? currentOptions : '', (_b = data[vO]) !== null && _b !== void 0 ? _b : '');
        }
        renderTemplate(fileName)
            .then(function (res) {
            callback(res);
            currentViewData = undefined;
            currentOptions = undefined;
        })
            .catch(function () {
            retry = 1;
            renderTemplate(fileName)
                .then(function (res) {
                callback(res);
                currentViewData = undefined;
                currentOptions = undefined;
            })
                .catch(function () {
                retry = 2;
                renderTemplate(fileName)
                    .then(function (res) {
                    callback(res);
                    currentViewData = undefined;
                    currentOptions = undefined;
                })
                    .catch(function () {
                    retry = 3;
                    renderTemplate(fileName)
                        .then(function (res) {
                        callback(res);
                        currentViewData = undefined;
                        currentOptions = undefined;
                    })
                        .catch(function () {
                        retry = 4;
                        renderTemplate(fileName)
                            .then(function (res) {
                            callback(res);
                            currentViewData = undefined;
                            currentOptions = undefined;
                        })
                            .catch(function (err) {
                            throw new Error(err);
                        });
                    });
                });
            });
        });
        if (request.headers.Accept !== '*/*' || request.headers.hasOwnProperty('clicked')) {
            previousViewData[fileName] = currentViewData;
            previousOptions[fileName] = currentOptions;
        }
    });
}
function setupAssets() {
    electron_1.protocol.registerFileProtocol('asset', function (request, callback) {
        var hostName = url.parse(request.url).hostname;
        var fileName = parseFilePath(request.url);
        var filePath = path.join(process.cwd(), currentAssetFolderPath, hostName, fileName);
        callback({ path: filePath });
    });
}
function renderTemplate(fileName) {
    return new Promise(function (resolve, reject) {
        try {
            var extension = "." + currentRendererName;
            var filePath = path.join(currentViewsFolderPath, "" + fileName + extension);
            var options = currentOptions || new Object();
            var viewData = currentViewData || new Object();
            if (permanentOpts !== undefined) {
                for (var item in permanentOpts) {
                    if (permanentOpts.hasOwnProperty(item)) {
                        options[item] = permanentOpts[item];
                    }
                }
            }
            if (permanentVD !== undefined) {
                for (var item in permanentVD) {
                    if (permanentVD.hasOwnProperty(item)) {
                        viewData[item] = permanentVD[item];
                    }
                }
            }
            rendererAction(filePath, viewData, options, function (renderedHTML) {
                try {
                    resolve({
                        mimeType: 'text/html',
                        data: Buffer.from(renderedHTML),
                    });
                }
                catch (error) {
                    resolve({
                        mimeType: 'text/html',
                        data: Buffer.from(renderedHTML.contents.toString()),
                    });
                }
            });
        }
        catch (error) {
            if (debugMode) {
                console.log(error);
            }
            reject(error);
        }
    });
}
function rendererAction(filePath, viewData, options, callback) {
    if (debugMode) {
        console.log(retry);
    }
    switch (retry) {
        case 0:
            currentRenderer.currentRenderFunction(filePath, viewData, function (error, html) {
                // twig doesnt have any kind of catch it simply throws an error so we have to do twig first just in case
                if (error)
                    throw new Error(error);
                callback(html);
                return;
            });
            callback(undefined); // somehow this is running before the function above if anyone wants to use twig please feel free to try and fix this as ive used promises, async await try catch everything i can think of and can't get it to work
            break;
        case 1:
            currentRenderer.currentRenderFunction(fs.readFileSync(process.cwd() + '\\' + filePath, 'utf8'), viewData, options, function (error, html1) {
                if (error)
                    throw new Error(error);
                try {
                    // TODO: Optimise this into its own case to prevent doing it every load
                    html1
                        .then(function (result) {
                        return result;
                    })
                        .then(function (htmlRes) {
                        callback(htmlRes);
                    });
                }
                catch (error) {
                    callback(html1);
                }
                return;
            });
            callback(undefined);
            break;
        case 2:
            var html2 = currentRenderer.currentRenderFunction(fs.readFileSync(process.cwd() + '\\' + filePath, 'utf8'), viewData, options);
            try {
                // TODO: Optimise this into its own case to prevent doing it every load
                html2
                    .then(function (result) {
                    return result;
                })
                    .then(function (htmlRes) {
                    callback(htmlRes);
                });
            }
            catch (error) {
                callback(html2);
            }
            callback(undefined);
            break;
        case 3:
            currentRenderer.currentRenderFunction(filePath, viewData, options, function (error, html3) {
                if (error)
                    throw new Error(error);
                try {
                    // TODO: Optimise this into its own case to prevent doing it every load
                    html3
                        .then(function (result) {
                        return result;
                    })
                        .then(function (htmlRes) {
                        callback(htmlRes);
                    });
                }
                catch (error) {
                    callback(html3);
                }
                return;
            });
            callback(undefined);
            break;
        case 4:
            var html4 = currentRenderer.currentRenderFunction(filePath, viewData, options);
            try {
                // TODO: Optimise this into its own case to prevent doing it every load
                html4
                    .then(function (result) {
                    return result;
                })
                    .then(function (htmlRes) {
                    callback(htmlRes);
                });
            }
            catch (error) {
                callback(html4);
            }
            callback(undefined);
            break;
    }
}
function use(renderer, useAssets, assetFolderPath, viewsFolderPath, renderFunction, name, debug) {
    currentRenderer = renderer;
    debugMode = debug;
    try {
        currentRendererName = currentRenderer.name.toLowerCase();
    }
    catch (_a) {
        if (name) {
            currentRendererName = name.toLowerCase();
        }
        else {
            throw new Error("This renderer doesn't have a default name assigned please pass it as the 6th parameter in the `.use` function.");
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
function permOpts(permanentOptions) {
    permanentOpts = permanentOptions;
}
exports.permOpts = permOpts;
function permViewData(permanentViewData) {
    permanentVD = permanentViewData;
}
exports.permViewData = permViewData;
