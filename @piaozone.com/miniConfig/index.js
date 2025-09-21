const envConfig = {
    'wx5ccd0e5e2bb91b19':{
        baseUrl: 'https://api-sit.piaozone.com/test/m10',
        appid: 'wx5ccd0e5e2bb91b19',
        product: 'pwy-dev',
        ddAppId: '5004'
    },
    'wxb5de26c7f5dc89c6': {
        baseUrl: 'https://api-dev.piaozone.com/test/m10',
        appid: 'wxb5de26c7f5dc89c6',
        product: 'pwy-test',
        env: 'test'
    },
    'wxa3a3844ae7205f76': {
        baseUrl: 'https://api.piaozone.com/m10',
        appid: 'wxa3a3844ae7205f76',
        product: 'pwy-release',
        env: 'prod'
    }
}

export const getEnv = (appId) => {
    return envConfig[appId];
}

// export const authorThird = { //第三方应用
//     'ddTaxi': { //旧滴滴发票
//       ddAppId: '5004',
//       appId: 'wx34c1a56b500384ad',
//       signKey:'D39JDk9~dd9jA09089jd',
//       invoiceHistory: 'https://page.xiaojukeji.com/m/invoicehistory.html',
//       invoicePage: 'https://page.xiaojukeji.com/m/invoiceeplcar.html',
//       authorPath: 'https://page.xiaojukeji.com/m/dataplateform.html',
//       envVersion: 'release'
//     }
// }

export const authorThird = { //第三方应用
    ddTaxi: { //滴滴发票
        ddAppId: '5004',
        appId: 'wx34c1a56b500384ad',
        signKey: 'D39JDk9~dd9jA09089jd',
        invoiceHistory: 'https://page.xiaojukeji.com/market/invoicehistorynew.html',
        invoicePage: 'https://page.xiaojukeji.com/market/invoiceeplcarnew.html',
        authorPath: 'https://page.xiaojukeji.com/market/dataplateformnew.html#/platform/authorize',
        cancelAuthorPath: 'https://page.xiaojukeji.com/market/dataplateformnew.html#/platform/result',
        envVersion: 'release'
    }
}