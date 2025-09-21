import * as commonLogins from '../govLoginLibs/apiLogin';

export class ApiLoginService extends BaseService {
    allowApiLogin(baseUrl: string) {
        const ctx = this.ctx;
        const { taxNo = {}, isNewTimeTaxNo } = ctx.request.query || {};
        if (isNewTimeTaxNo) {
            return true;
        }
        const listTaxNos = [
            '91120110MA06ACMN8L',
            '91370214686782800X',
            '91500000660885641M',
            '91150121MA0QJK324N',
            '91330302726593124M',
            '521101130918620437', // beijing
            '91130725MA0FGCLN2W', // hebei
            '91140721MA7Y6BFE33', // shanxi
            '91150203MAC7WW0X7T', // neimenggu
            '91210100001608667P', // liaoning
            '91220881MA1798N61X', // jilin
            '912301110860070348', // heilongjiang
            '91310115MA1K4CX363', // shanghai
            '9132050857376821XP', // jiangsu
            '91330201MA2CM1A83F', // ningbo
            '91340181322798836Y', // anhui
            '91350505705245753B', // fujian
            '913502036782736864', // xiamen
            '91360121553541130L', // jiangxi
            '91370100MA3CJJH31J', // shandong
            '91370214MA3C9JFP4X', // qingdao
            '91410100675382342Q', // henan
            '914101003268570983',
            '914290040606675877', // hubei
            '91430100395015783Q', // hunan
            '914501006927736954', // guangxi
            '91469007MA7FX2PY64', // hainan
            '91500119MA7EUG1KX6', // chongqing
            '91510105728041155C', // sichuan
            '91522300709688201J', // guizhou
            '91530500741472443C', // yunnan
            '91611105MA6TWWU152', // shaanxi
            '91621121MA71ATR9XE ', // gansu
            '91632802MABY1LA55H', // qinghai
            '91652902MA7HMQ962E', // xinjiang
            '91320506MA1MQWBWX9' // jiangsu
        ];
        const hosts = baseUrl.split('.');
        const cityName: string = hosts[1];
        const notAllowCitys : any = [
            'dalian',
            'guangxi',
            'hebei',
            'yunnan',
            'chongqing',
            'beijing',
            'shanghai',
            'guangdong',
            'anhui'
        ];
        if (notAllowCitys.includes(cityName)) {
            return false;
        }

        if (ctx.app.config.env === 'sit') {
            ctx.service.log.info('sit环境通过底层api登录');
            return true;
        }

        if (taxNo && listTaxNos.includes(taxNo)) {
            ctx.service.log.info('通过底层api登录');
            return true;
        }

        const allowCitys = [
            'qingdao',
            'chongqing',
            'shenzhen',
            'guangdong',
            'neimenggu',
            'hunan', // 目前湖南登录会提示选择角色
            'guangxi',
            'hebei',
            'jiangxi',
            'tianjin',
            'zhejiang',
            'xizang',
            'ningxia',
            'liaoning',
            'fujian',
            'xiamen',
            'yunnan',
            'xinjiang',
            'shanghai',
            'sichuan',
            'shaanxi',
            'beijing',
            'hainan',
            'heilongjiang',
            'ningbo',
            'shandong',
            'henan',
            'jiangsu'
        ];
        // const allowCitys : any = [];
        if (allowCitys.includes(cityName)) {
            ctx.service.log.info('通过底层api登录');
            return true;
        }
        return false;
    }

    getRoleType(roleText = '') {
        switch (roleText) {
            case '':
                return '09';
            case '法定代表人':
                return '01';
            case '财务负责人':
                return '02';
            case '办税员':
                return '03';
            case '开票员':
                return '09';
            case '管理员':
                return '05';
            case '社保经办人':
                return '08';
            case '销售人员':
                return '10';
            default:
                return '09';
        }
    }

    async login(opt: any = {}, loginTools : {
        eLoginUrl: string;
        apiWaitLogin: Function;
        redirectURI: string;
    }, retry?: number) {
        const ctx = this.ctx;
        ctx.service.log.info('baseLoginService plugin service------------');
        const { eLoginUrl, apiWaitLogin, redirectURI } = loginTools;
        const { cityPageId, isNewTimeTaxNo } = ctx.request.query;
        const { data = {} } = opt;
        if (isNewTimeTaxNo) {
            const res = await ctx.service.newTime.login(data);
            return res;
        }

        const { taxNo = '', account = '', accountPasswd = '', roleText = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        const roleType = this.getRoleType(roleText);
        const hosts = eLoginUrl.split('.');
        const cityName: string = hosts[1];

        let startTime = +new Date();
        // 前置检查异常
        const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
            id: cityPageId,
            // session: electronSession.fromPartition('persist:' + cityPageId)
            partition: 'persist:' + cityPageId
        });
        ctx.service.log.info('打开税局登录页', (+new Date()) - startTime);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        const nt = ntRes.data;
        startTime = +new Date();
        // 获取到跳转url
        let res = await nt.wait(apiWaitLogin, {
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('获取跳转url', (+new Date() - startTime), res);
        if (res.errcode !== '0000') {
            return res;
        }
        if (res.data?.isLogined === true) {
            res = await ctx.service.etaxFpdkLogin[cityName].etaxLoginSuccess(nt, data);
            // 可能是登录失效允许自动重试一次
            if (res.errcode === '91300' && !retry) {
                const result: any = await this.login(opt, loginTools, 1);
                return result;
            }
            return res;
        }
        startTime = +new Date();
        // 需要跳转到登录url
        if (res.data?.loginUrl) {
            await nt.goto(res.data.loginUrl);
            ctx.service.log.info('goto end', (+new Date() - startTime));
            startTime = +new Date();
            res = await nt.wait(apiWaitLogin, {
                waitTimeout: 20000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('apiWaitLogin res', (+new Date() - startTime), res);
            if (res.errcode !== '0000') {
                return res;
            }
            if (res.data?.isLogined === true) {
                res = await ctx.service.etaxFpdkLogin[cityName].etaxLoginSuccess(nt, data);
                if (res.errcode === '91300' && !retry) {
                    const result: any = await this.login(opt, loginTools, 1);
                    return result;
                }
                return res;
            }
        }

        res = await nt.wait(commonLogins.apiLogin, {
            ...data,
            roleType,
            redirectURI
        });
        ctx.service.log.info('apiLogin res', (+new Date() - startTime), res);
        if (res.errcode !== '0000') {
            return res;
        }
        if (res.data?.errMsg) {
            return {
                ...errcodeInfo.govErr,
                description: res.data?.errMsg
            };
        }

        await nt.goto(res.data.url);
        res = await ctx.service.etaxFpdkLogin[cityName].etaxLoginSuccess(nt, data);
        return res;
    }

    async firstLogin(opt : any = {}, loginTools : {
        eLoginUrl: string;
        apiWaitLogin: Function;
        redirectURI: string;
    }, retry?: number) {
        const ctx = this.ctx;
        const { eLoginUrl, apiWaitLogin, redirectURI } = loginTools;
        ctx.service.log.info('baseLoginService plugin service------------');
        const { cityPageId, isNewTimeTaxNo } = ctx.request.query;
        const { data = {} } = opt;
        if (isNewTimeTaxNo) {
            return errcodeInfo.success;
        }
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            ctx.service.log.info('登录关键参数为空');
            return errcodeInfo.argsErr;
        }
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        let startTime = +new Date();
        if (!nt || !nt.nightmareWindow.win) {
            const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
                id: cityPageId,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
            });
            ctx.service.log.info('打开窗体返回', cityPageId, (+new Date()) - startTime, ntRes.errcode, ntRes.description);
            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            nt = ntRes.data;
        } else {
            await nt.goto(eLoginUrl);
        }
        const hosts = eLoginUrl.split('.');
        const cityName: string = hosts[1];

        let res = await nt.wait(apiWaitLogin, {
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('登录前检查返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        // 直接登录成功
        if (res.data?.isLogin) {
            res = await ctx.service.etaxFpdkLogin[cityName].etaxLoginSuccess(nt, opt);
            if (res.errcode === '91300' && !retry) {
                const result: any = await this.firstLogin(opt, loginTools, 1);
                return result;
            }
            return res;
        }

        if (res.data?.loginUrl) {
            await nt.goto(res.data.loginUrl);
            ctx.service.log.info('goto end', (+new Date() - startTime));
            startTime = +new Date();
            res = await nt.wait(apiWaitLogin, {
                waitTimeout: 20000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('apiWaitLogin res', (+new Date() - startTime), res);
            if (res.errcode !== '0000') {
                return res;
            }
            if (res.data?.isLogined === true) {
                res = await ctx.service.etaxFpdkLogin[cityName].etaxLoginSuccess(nt, data);
                if (res.errcode === '91300' && !retry) {
                    const result: any = await this.firstLogin(opt, loginTools, 1);
                    return result;
                }
                return res;
            }
        }

        res = await nt.wait(commonLogins.apiFirstLogin, {
            ...data,
            redirectURI
        });
        ctx.service.log.info('第一步登录返回', eLoginUrl, res);
        if (res.errcode !== '0000' || res.data?.errMsg) {
            return res.errcode === '0000' ? {
                ...errcodeInfo.govErr,
                description: res.data.errMsg
            } : res;
        }
        return res;
    }

    // 发送短信验证码
    async sendShortMsg(opt: any = {}, loginTools : {
        eLoginUrl: string;
        apiWaitLogin: Function;
        redirectURI: string;
    }) {
        const ctx = this.ctx;
        const { cityPageId, isNewTimeTaxNo } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        const { data = {} } = opt;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (isNewTimeTaxNo) {
            const res = await ctx.service.newTime.login({
                ...data,
                shortMsgCode: '',
                shortMsg: ''
            });
            return res;
        }
        const infoList = cityPageId.split('-');
        const pageAccount = decodeURIComponent(infoList[2]);
        if (!taxNo || !account || !accountPasswd) {
            ctx.service.log.info('登录发送短信关键参数为空');
            return {
                ...errcodeInfo.argsErr,
                description: '参数错误，请求检查登录账号信息！'
            };
        }
        if (pageAccount !== account) {
            return {
                ...errcodeInfo.argsErr,
                description: '登录信息和企业不一致，请检查!'
            };
        }

        // 有效的窗体
        let isValidNt = true;
        let startTime = +new Date();
        let res : any;
        // 窗体不存在
        if (!nt || !nt.nightmareWindow.win) {
            res = await this.firstLogin(opt, loginTools);
            if (res.errcode !== '0000') {
                return res;
            }
            // 已经登录成功
            if (res.data?.etaxAccountType) {
                return res;
            }
            nt = ctx.bsWindows.fpdkGovWin[cityPageId];
        }


        const checkRes = await nt.evaluate(commonLogins.sendMsgPreCheck, {
            account,
            taxNo
        });
        ctx.service.log.info('发送短信前检查返回', (+new Date()) - startTime, checkRes);
        if (checkRes === false || (typeof checkRes !== 'boolean' && checkRes.errcode !== '0000')) {
            isValidNt = false;
        }

        // 校验不是有效的窗体，重新通过第一步登录重试
        if (!isValidNt) {
            startTime = +new Date();
            const firstRes = await this.firstLogin(opt, loginTools);
            ctx.service.log.info('第一步登录失效，自动登录第一步返回', (+new Date()) - startTime, firstRes);
            if (firstRes.errcode !== '0000') {
                return firstRes;
            }
            // 已经登录成功，不需要发送短信
            if (firstRes.data?.etaxAccountType) {
                return firstRes;
            }
            nt = ctx.bsWindows.fpdkGovWin[cityPageId];
        }

        startTime = +new Date();
        res = await nt.evaluate(commonLogins.apiSendShortMsg, {
            taxNo,
            account
        });
        ctx.service.log.info('发送短信返回', res);
        const resDes = res.description || '';
        if (resDes.indexOf('身份认证已失效') !== -1) {
            startTime = +new Date();
            const firstRes = await this.firstLogin(opt, loginTools);
            ctx.service.log.info('身份认证已失效，自动登录第一步返回', (+new Date()) - startTime, firstRes);
            if (firstRes.errcode !== '0000') {
                return firstRes;
            }
            startTime = +new Date();
            res = await nt.evaluate(commonLogins.apiSendShortMsg, {
                taxNo,
                account
            });
            ctx.service.log.info('身份认证已失效，重新发送验证码返回', (+new Date()) - startTime, res);
        }
        if (res.errcode !== '0000') {
            return res;
        }
        return errcodeInfo.success;
    }

    // 第二部登录
    async secondLogin(opt : any = {}, loginTools : {
        eLoginUrl: string;
        apiWaitLogin: Function;
        redirectURI: string;
    }) {
        const ctx = this.ctx;
        const { cityPageId, isNewTimeTaxNo } = ctx.request.query;
        const { data = {} } = opt;
        if (isNewTimeTaxNo) {
            const res = await ctx.service.newTime.login(data);
            return res;
        }
        const { shortMsgCode = '', shortMsg = '', account, taxNo, roleText = '' } = data;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[cityPageId] : null;
        const smsCode = shortMsgCode || shortMsg || '';

        ctx.service.log.info('短信登录', cityPageId, account, smsCode);
        if (!nt || !nt.nightmareWindow.win) {
            ctx.service.log.info('第一步登录已失效', cityPageId);
            return {
                errcode: '95000',
                description: '第一步登录已失效，请重新获取验证码再登录!'
            };
        }
        const roleType = this.getRoleType(roleText);
        if (!smsCode) {
            return {
                errcode: '95000',
                description: '短信验证码不能为空，请检查!'
            };
        }
        const { eLoginUrl } = loginTools;
        const hosts = eLoginUrl.split('.');
        let cityName: string = hosts[1];
        let res = await nt.evaluate(commonLogins.apiSecondLogin, {
            roleType,
            taxNo,
            account,
            smsCode,
            redirectURI: loginTools.redirectURI
        });
        if (cityName === 'shanghai') {
            cityName = 'shanghaiV2';
        }
        ctx.service.log.info('税局第二步登录返回', cityName, res);
        if (res.errcode !== '0000') {
            return res;
        }
        await nt.goto(res.data.url);
        res = await ctx.service.etaxFpdkLogin[cityName].etaxLoginSuccess(nt, data);
        return res;
    }

    async checkAccount(opt: any = {}, loginTools : {
        eLoginUrl: string;
        apiWaitLogin: Function;
        redirectURI: string;
    }, retry?: number) {
        const ctx = this.ctx;
        ctx.service.log.info('baseLoginService plugin checkAccount------------');
        const { eLoginUrl, apiWaitLogin, redirectURI } = loginTools;
        const { cityPageId } = ctx.request.query;
        const { data = {} } = opt;

        const { taxNo = '', account = '', accountPasswd = '', roleText = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        const roleType = this.getRoleType(roleText);

        let startTime = +new Date();
        // 前置检查异常
        const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
            id: cityPageId,
            // session: electronSession.fromPartition('persist:' + cityPageId)
            partition: 'persist:' + cityPageId
        });
        ctx.service.log.info('打开税局登录页', (+new Date()) - startTime);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        const nt = ntRes.data;
        startTime = +new Date();
        // 获取到跳转url
        let res = await nt.wait(apiWaitLogin, {
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('获取跳转url', (+new Date() - startTime), res);
        if (res.errcode !== '0000') {
            return res;
        }
        if (res.data?.isLogined === true) {
            return res;
        }
        startTime = +new Date();
        // 需要跳转到登录url
        if (res.data?.loginUrl) {
            await nt.goto(res.data.loginUrl);
            ctx.service.log.info('goto end', (+new Date() - startTime));
            startTime = +new Date();
            res = await nt.wait(apiWaitLogin, {
                waitTimeout: 20000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('apiWaitLogin res', (+new Date() - startTime), res);
            if (res.errcode !== '0000') {
                return res;
            }
            if (res.data?.isLogined === true) {
                return res;
            }
        }

        res = await nt.wait(commonLogins.apiLogin, {
            ...data,
            roleType,
            redirectURI
        });
        ctx.service.log.info('apiLogin res', (+new Date() - startTime), res);
        if (res.errcode !== '0000') {
            return res;
        }
        if (res.data?.errMsg) {
            return {
                ...errcodeInfo.govErr,
                description: res.data?.errMsg
            };
        }

        return res;
    }
}