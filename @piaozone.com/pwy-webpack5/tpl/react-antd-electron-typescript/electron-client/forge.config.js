
const fs = require('fs');
const pathTool = require('path');

const checkDirectory = function (src) {
    try {
        fs.accessSync(src, fs.constants.F_OK);
        return true;
    } catch (error) {
        console.error('error', error);
        return false;
    }
};

// 清理掉某个目录或者删除掉某个文件
const clearTarget = function(src) {
    // 文件
    if (fs.statSync(src).isFile()) {
        fs.unlinkSync(src);
        return;
    }

    const paths = fs.readdirSync(src); // 同步读取当前目录
    // 空目录
    if (paths.length === 0) {
        fs.rmdirSync(src);
        return;
    }

    paths.forEach(function (path) {
        var _src = pathTool.join(src, path);
        clearTarget(_src);
    });
    fs.rmdirSync(src);
}


module.exports = {
    "packagerConfig": {
        // icon, // 安装后的
        afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
            callback();
        }],
        afterExtract: [(buildPath, electronVersion, pPlatform, pArch, callback) => {
            callback();
        }],
        afterPrune: [(buildPath, electronVersion, pPlatform, pArch, callback) => {
            const err = new Error('test');
            try {
                const buildNodeModuleDir = pathTool.join(buildPath, 'node_modules');
                const jsonObj = require(pathTool.join(buildPath, 'package.json'));
                const dependencies = jsonObj.dependencies || {};
                const dpKeys = Object.keys(dependencies);
                const lists = fs.readdirSync(buildNodeModuleDir);
                lists.forEach(item => {
                    const curDir = pathTool.join(buildNodeModuleDir, item);
                    const isDir = fs.statSync(curDir).isDirectory();
                    if (isDir && dpKeys.indexOf(item) === -1) {
                        fs.rmdirSync(curDir);
                    }
                });
                // 删除源码目录
                clearTarget(pathTool.join(buildPath, 'src'));
            } catch (error) {
                callback(error);
                return;
            }
            callback();
        }]
    },
    "makers": [{
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "electron_client",
                iconUrl:  pathTool.join(__dirname, "/dist/web/facicon.ico"),//可以是本地全路径也可以是url
                // loadingGif: pathTool.join(__dirname, "/dist/web/loading.gif")
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ]
}