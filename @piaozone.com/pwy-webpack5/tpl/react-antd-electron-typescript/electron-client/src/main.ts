const {
    app,
    BrowserWindow
} = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const port = process.env.DEV_SERVER_PORT || 9000;

if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

if (isDev) {
    try {
        require('@piaozone.com/electron-reloader')(module, {
            debug: true
        });
    } catch (_) {
        console.log('reloadererr', _);
    }
}


const createWindow = () : void => {
    const mainWindow = new BrowserWindow({
        useContentSize: true,
        resizable: false,
        width: 800,
        height: 600,
        icon: path.join(__dirname, '../web/favicon.icon'),
        autoHideMenuBar: true, // 隐藏菜单
        webPreferences: {
            // 主进程和渲染进程直接的相互访问通过preload
            preload: path.join(__dirname, 'preload.js')
        }
    });
    const startUrl = isDev ? `http://localhost:${port}` : path.join(__dirname, '../web/index.html');
    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});