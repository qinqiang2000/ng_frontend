import http from 'http';
import EventEmitter from 'events';

declare global {
    interface myPwyStore {
        get: Function;
        set: Function;
        delete: Function;
    }

    interface bodyResDataType {
        taxNo: string;
        taxPeriod: string;
        skssq: string;
        gxrqfw: string;
        gxczjzrq: string;
        companyType: string;
        companyName: string;
        homeUrl: string;
        etaxAccountType: number;
    }

    interface loginDataType extends bodyResDataType {
        roleText?: string;
        openInvoiceCompany?: number;
        szzhCompany?: number;
        pageId: string;
        loginedCookies: string;
        eUrl: string;
        szzhDomain: string;
        szzhUrl: string;
        baseUrl: string;
        createTime: number;
        etaxBackendUrl?: string;
        backendCookies?: string;
    }

    interface contentHelperType {
        curl: Function;
        jsonCurl: Function;
        request: Function;
    }

    interface ControllerCtxRequestType {
        method: string;
        url: string;
        query: any;
        body: any;
        headers: http.IncomingHttpHeaders;
        app?: any
    }

    interface ControllerCtxType {
        bsWindows: any;
        uid: string;
        res: http.ServerResponse;
        request: ControllerCtxRequestType;
        logger: any;
        helper: contentHelperType;
        service?: any;
        app?: any,
        eventEmitter: EventEmitter,
        db: any,
        pwyWsClientApp: any;
        body?: any;
        isEncrypt: Boolean;
        clientApp: any;
    }

    interface BaseControllerOptType {
        ctx: ControllerCtxType;
    }

    interface Window {
        pwyNightmare: {
            resolve: any;
            reject: any;
            send: any;
            error: any;
            getCookie: any;
            fetch: any;
            errcodeInfo: any;
            urlParam: any;
            xlsx: any;
            handleResult: any;
            sleep: any;
            getBase64Image: any;
            createXlsxFile: any;
        };
    }

    class BaseService {
        ctx: any;
        constructor(opt: any);
    }

    interface lockLoginOptions {
        autoLogin?: boolean,
        closeNotVaildNt?: boolean;
        step?: 'first' | 'last',
        isShanghaiLogin?: boolean
    }

    function setTimeout(f: Function, t: number): any;
    function httpRequest(url: string, opt: any, retry?: number) : any;

    const pwyStore: myPwyStore;
    const errcodeInfo: any;
    const etaxLoginedCachePreKey: string;
    const companyOpenInvoiceLimitPreKey: string;
    const xlsx: any;
    const base_xlsx: any;
    const moment: any;
    const qrcode: any;
    const urllib: any;
    const log: any;
    const hex_md5: any;
    const moduleHttp: any;
    const moduleHttps: any;
    const moduleUrl: any;
    const BrowserWindow: any;
    const path: any;
    const aesEncrypt: any;
    const fs: any;
}
