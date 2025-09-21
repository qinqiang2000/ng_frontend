//监听自动更新事件
const { ipcRenderer } = require('electron');

let len = 5,timer=null;
 ipcRenderer.on('message', (event, text) => {
    console.log('on message', event, text);
});

ipcRenderer.on('downloadProgress', (event, progressObj)=> {
    console.log('downloadProgress', progressObj);
});

ipcRenderer.on('isUpdateNow', () => {
    console.log('isUpdateNow');
    ipcRenderer.send('isUpdateNow');
});
