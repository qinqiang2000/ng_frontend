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
        client_id?: string;
        pageId: string;
        loginedCookies: string;
        eUrl: string;
        szzhDomain: string;
        szzhUrl: string;
        baseUrl: string;
        createTime: number;
        etaxBackendUrl?: string;
        backendCookies?: string;
        access_token?: string;
        getLzkqow?: boolean;
        referer?: string;
        publicKeyInfo?: string;
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
    }

    interface Window {
        pwyNightmare: {
            resolve: any;
            reject: any;
            send: any;
            error: any;
            getCookie: any;
            setCookie: Function;
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

    interface simulateClickType {
        minDot?: number;
        maxDot?: number;
        selector?: string
    }

    class BaseService {
        ctx: any;
        constructor(opt: any);
    }

    function setTimeout(f: Function, t: number): any;
    function httpRequest(url: string, opt: any, retry?: number) : any;
    function aesEncrypt(data: string, key: string, iv?: string): string;
    function simulateClick(opt: { minDot?: number, maxDot?: number, selector?: '' }): any[] | boolean;

    const pwyStore: myPwyStore;
    const errcodeInfo: any;
    const etaxLoginedCachePreKey: string;
    const companyOpenInvoiceLimitPreKey: string;
    const xlsx: any;
    const base_xlsx: any;
    const path: any;
    const fs: any;
    const moment: any;
    const qrcode: any;
    const urllib: any;
    const log: any;
    const hex_md5: any;
    const moduleUrl: any;
    const moduleHttps: any;
    const moduleCrypto: any;
    const electronSession: any;
}
