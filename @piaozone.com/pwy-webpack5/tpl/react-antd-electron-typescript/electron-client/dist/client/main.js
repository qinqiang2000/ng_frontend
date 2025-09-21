var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow;
var path = require('path');
var isDev = process.env.NODE_ENV === 'development';
var port = process.env.DEV_SERVER_PORT || 9000;
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}
if (isDev) {
    try {
        require('@piaozone.com/electron-reloader')(module, {
            debug: true
        });
    }
    catch (_) {
        console.log('reloadererr', _);
    }
}
var createWindow = function () {
    var mainWindow = new BrowserWindow({
        useContentSize: true,
        resizable: false,
        width: 800,
        height: 600,
        icon: path.join(__dirname, '../web/favicon.icon'),
        autoHideMenuBar: true,
        webPreferences: {
            // 主进程和渲染进程直接的相互访问通过preload
            preload: path.join(__dirname, 'preload.js')
        }
    });
    var startUrl = isDev ? "http://localhost:".concat(port) : path.join(__dirname, '../web/index.html');
    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
};
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map