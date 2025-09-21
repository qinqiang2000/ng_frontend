import { FaceCheck } from './controller/faceCheck';
import openInvoice from './routes/openInvoice';
import queryInvoice from './routes/queryInvoice';
import fptsInvoice from './routes/fptsInvoice';
import LoginController from './controller/login';
import { HelperController } from './controller/helper';

import loginCommon from './routes/loginCommon';

import guangdong from './routes/guangdong';
import henan from './routes/henan';
import shaanxi from './routes/shaanxi';
import shenzhen from './routes/shenzhen';
import sichuan from './routes/sichuan';
import fujian from './routes/fujian';
import ningbo from './routes/ningbo';
import yunnan from './routes/yunnan';
import liaoning from './routes/liaoning';
import jiangsu from './routes/jiangsu';
import zhejiang from './routes/zhejiang';
import gansu from './routes/gansu';
import jilin from './routes/jilin';
import shanxi from './routes/shanxi';
import guangxi from './routes/guangxi';
import hubei from './routes/hubei';

import chongqing from './routes/chongqing';
import qingdao from './routes/qingdao';
import neimenggu from './routes/neimenggu';
import tianjin from './routes/tianjin';
import xiamen from './routes/xiamen';
import dalian from './routes/dalian';
import shanghai from './routes/shanghai';

import jiangxi from './routes/jiangxi';
import hebei from './routes/hebei';
import xinjiang from './routes/xinjiang';
import shandong from './routes/shandong';
import beijing from './routes/beijing';
import hunan from './routes/hunan';
import anhui from './routes/anhui';
import guizhou from './routes/guizhou';
import xizang from './routes/xizang';
import ningxia from './routes/ningxia';
import heilongjiang from './routes/heilongjiang';
import helperRoutes from './routes/helper';
import loginRoutes from './routes/login';
import etaxV4 from './routes/etaxV4';
interface routType {
    path: string,
    method: string,
    overwriteFlag?: boolean,
    middlewares?: Function[],
    handleFunc?: Function
}

export default function routes(app: any) {
    let routeList: routType[] = [{
        path: '/fpdk/etax/scanFace/check/url',
        method: 'POST',
        overwriteFlag: true,
        middlewares: [app.middleware.checkRequest()],
        handleFunc: (opt: BaseControllerOptType) => new FaceCheck(opt).getUrl()
    }, {
        path: '/fpdk/etax/login/type',
        method: 'POST',
        overwriteFlag: true,
        handleFunc: (opt: BaseControllerOptType) => new LoginController(opt).getLoginType()
    }, {
        path: '/fpdk/etax/release/login/lock',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new LoginController(opt).relaseLock()
    }, {
        path: '/fpdk/etax/login/keepAlive',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new LoginController(opt).keepAlive()
    }, {
        path: '/fpdk/etax/switch/company',
        method: 'POST',
        handleFunc: (opt: BaseControllerOptType) => new LoginController(opt).switchCompany()
    }];

    routeList = routeList.concat(helperRoutes(app));
    routeList = routeList.concat(openInvoice(app));
    routeList = routeList.concat(queryInvoice(app));
    routeList = routeList.concat(fptsInvoice(app));

    routeList = routeList.concat(loginRoutes(app));
    routeList = routeList.concat(loginCommon(app));
    routeList = routeList.concat(tianjin(app));
    routeList = routeList.concat(neimenggu(app));
    routeList = routeList.concat(qingdao(app));
    routeList = routeList.concat(chongqing(app));
    routeList = routeList.concat(fujian(app));
    routeList = routeList.concat(guangdong(app));
    routeList = routeList.concat(henan(app));
    routeList = routeList.concat(shaanxi(app));
    routeList = routeList.concat(shenzhen(app));
    routeList = routeList.concat(sichuan(app));
    routeList = routeList.concat(ningbo(app));
    routeList = routeList.concat(yunnan(app));
    routeList = routeList.concat(liaoning(app));
    routeList = routeList.concat(jiangsu(app));
    routeList = routeList.concat(zhejiang(app));
    routeList = routeList.concat(gansu(app));
    routeList = routeList.concat(jilin(app));
    routeList = routeList.concat(shanxi(app));
    routeList = routeList.concat(guangxi(app));
    routeList = routeList.concat(xiamen(app));
    routeList = routeList.concat(dalian(app));
    routeList = routeList.concat(shanghai(app));
    routeList = routeList.concat(hubei(app));
    routeList = routeList.concat(jiangxi(app));
    routeList = routeList.concat(hebei(app));
    routeList = routeList.concat(xinjiang(app));
    routeList = routeList.concat(shandong(app));
    routeList = routeList.concat(beijing(app));
    routeList = routeList.concat(hunan(app));
    routeList = routeList.concat(anhui(app));
    routeList = routeList.concat(guizhou(app));
    routeList = routeList.concat(xizang(app));
    routeList = routeList.concat(ningxia(app));
    routeList = routeList.concat(heilongjiang(app));
    routeList = routeList.concat(etaxV4(app));
    return routeList;
}
