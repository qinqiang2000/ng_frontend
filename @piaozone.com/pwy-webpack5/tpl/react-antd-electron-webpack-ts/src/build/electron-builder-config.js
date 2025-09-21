module.exports = {
    "compression": "maximum",
    "asar": true,
    "productName": "pwy-client",
    "appId": "com.piaozone.pwy-client",
    "copyright": "kingdee pwy",
    "directories": {
        "output": "out",
        "buildResources": "out"
    },
    "publish": [{
        "provider": "generic",
        "url": "http://localhost:90/download/"
    }],
    "win": {
        "icon": "dist/web/icons/icon_256.ico",
        "artifactName": "${productName}_setup_${version}.${ext}",
        "target": [{
            "target": "nsis",
            "arch": [
                "ia32"
            ]
        }]
    },
    "files": [
        "dist/**/*"
    ],
    "nsis": {
        "oneClick": false,
        "allowElevation": true,
        "allowToChangeInstallationDirectory": true,
        "installerIcon": "dist/web/icons/icon_64.ico",
        "uninstallerIcon": "dist/web/icons/icon_64.ico",
        "installerHeaderIcon": "dist/web/icons/icon_64.ico",
        "createDesktopShortcut": true,
        "createStartMenuShortcut": true,
        "shortcutName": "发票客户端小程序",
        "include": "src/build/installer.nsh"
    }
}