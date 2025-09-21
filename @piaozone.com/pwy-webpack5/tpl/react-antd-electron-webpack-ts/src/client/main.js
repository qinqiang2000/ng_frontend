
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.DEV_SERVER_PORT || 9000;
const uploadUrl = 'http://localhost:90/static/download';

if (isDev) {
    try {
        require('@piaozone.com/electron-reloader')(module, {
            // debug: true,
            ignore: [
                'out',
                'dist/web',
                'src/public',
                'src/web',
                'src/build',
                '*.js',
                '*.json',
                '*.md'
            ]
        });
    } catch (_) {}
}

let mainWindow = null;

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text);
}

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle() {
    const message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新',
    };
    // const os = require('os');
    autoUpdater.setFeedURL(uploadUrl);
    autoUpdater.on('error', function (error) {
        console.log('err', error);
        sendUpdateMessage(message.error);
    });
    autoUpdater.on('checking-for-update', function () {
        sendUpdateMessage(message.checking);
    });
    autoUpdater.on('update-available', function (info) {
        console.log('update-available');
        sendUpdateMessage(message.updateAva);
    });
    autoUpdater.on('update-not-available', function (info) {
        console.log('update-not-available', info);
        sendUpdateMessage(message.updateNotAva);
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        console.log('download-progress', progressObj);
        mainWindow.webContents.send('downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        ipcMain.on('isUpdateNow', (e, arg) => {
            console.log(arguments);
            console.log('开始更新');
            canQuit = true;
            //some code here to handle event
            autoUpdater.quitAndInstall();
        });
        mainWindow.webContents.send('isUpdateNow');
    });

    ipcMain.on('checkForUpdate', () => {
        //执行自动更新检查
        autoUpdater.checkForUpdates();
    });
    autoUpdater.checkForUpdates();
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        useContentSize: true,
        resizable: false,
        width: 800,
        height: 600,
        icon: path.join(__dirname, '../web/icons/icon_256.icon'),
        autoHideMenuBar: true, // 隐藏菜单
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // 主进程和渲染进程直接的相互访问通过preload
            preload: path.join(__dirname, 'preload.js')
        }
    });
    const startUrl = isDev ? `http://localhost:${port}` : path.join(__dirname, '../web/index.html');
    if (isDev) {
        mainWindow.loadURL(startUrl);
    } else {
        mainWindow.loadFile(startUrl);
    }

    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', (event) => {
        mainWindow = null;
    });
    updateHandle();
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