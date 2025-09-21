
/* eslint-disable no-undef */
import * as govLogins from '../govLoginLibs/guangxi';

const eUrl = 'https://etax.guangxi.chinatax.gov.cn:9723';
const etaxBaseUrl = 'https://dppt.guangxi.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.guangxi.chinatax.gov.cn:9723/web/dzswj/ythclient/mh.html';
const redirectURI = 'https://etax.guangxi.chinatax.gov.cn:9723/web/dzswj/ythclient/mh.html';

export class GuangxiLoginService extends BaseService {
    async checkLogin(loginData = {}) {
        const ctx = this.ctx;
        // 检查登录状态是否失效
        const checkRes = await ctx.service.etaxFpdkLogin.common.checkLogin(loginData);
        return checkRes;
    }

    async stepOneTypes(nt: any, data: any = {}, retry = 0) {
        const ctx = this.ctx;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        let startTime = (+new Date());
        // 等待界面进入输入状态
        let res = await nt.wait(govLogins.stepOneInit, {
            waitTimeout: 18000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('init', (+new Date()) - startTime, res);
        if (res.errcode !== '0000') {
            return res;
        }

        // 输入账户信息
        startTime = +new Date();
        await nt.type('input[placeholder="统一社会信用代码/纳税人识别号"]', taxNo);
        await nt.type('input[placeholder="居民身份证号码/手机号码/用户名"]', account);
        await nt.type('input[placeholder="个人用户密码(初始密码为证件号码后六位)"]', accountPasswd);
        ctx.service.log.info('type', (+new Date()) - startTime);

        const inputErr = await nt.evaluate(govLogins.checkInputErr, data);
        // 输入有误，重复输入
        if (inputErr === true) {
            if (retry > 2) {
                ctx.service.log.info('输入账户信息三次重试后仍然异常');
                return errcodeInfo.govErr;
            }
            res = await this.stepOneTypes(nt, data, retry + 1);
            return res;
        }

        // 拖动滑块
        // startTime = +new Date();
        // res = await nt.evaluate(govLogins.drayBtn);
        // ctx.service.log.info('drayBtn2', (+new Date()) - startTime, res);
        // if (res.errcode !== '0000') {
        //     return res;
        // }

        // 拖动滑块
        const retryDrayData = await ctx.service.etaxFpdkLogin.common.retryDray(nt, retry);
        if (retryDrayData.errcode !== '0000') {
            return {
                ...errcodeInfo.argsErr,
                description: '登录异常，请稍后再试！'
            };
        }

        // 点击登录并获取第一步登录结果
        startTime = +new Date();
        await nt.click('.el-form button:last-child');
        await nt.evaluate(govLogins.clearErr);
        res = await nt.wait(govLogins.checkStepOneLogin, data);
        ctx.service.log.info('checkStepOneLogin', (+new Date()) - startTime, res);

        const resData = res.data || {};
        // 登录后出现错误提示，直接返回
        if (res.errcode !== '0000' || resData.errMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: res.errcode !== '0000' ? res.description : resData.errMsg
            };
        }
        return res;
    }

    // encryType 1、web层加密数据，使用RSA加密，2、为对称加密，在java后台解密
    /* eslint-disable complexity */
    async stepOneLogin(opt: any = {}) {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query;
        let nt;
        if (ctx.service.apiLogin.allowApiLogin(eUrl)) {
            const res = await ctx.service.apiLogin.firstLogin(opt, {
                eLoginUrl,
                apiWaitLogin: govLogins.apiWaitLogin,
                redirectURI
            });
            if (res.description.indexOf('税局升级') === -1) {
                return res;
            }
            const ntInfo = ctx.bsWindows.fpdkGovWin || {};
            nt = ntInfo[cityPageId] || null;
        }
        ctx.service.log.info('plugin service --------------');
        const { data = {} } = opt;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }

        // 打开税局
        const startTime = +new Date();
        if (!nt) {
            const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
                id: cityPageId,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
            });
            ctx.service.log.info('open nt', (+new Date()) - startTime);
            if (ntRes.errcode !== '0000') {
                return ntRes;
            }
            nt = ntRes.data;
        }

        const checkRes = await this.stepOneTypes(nt, data);
        return checkRes;
    }

    // 发送短信验证码
    async sendShortMsg(opt: any) {
        const ctx = this.ctx;
        if (ctx.service.apiLogin.allowApiLogin(eUrl)) {
            const res = await ctx.service.apiLogin.sendShortMsg(opt, {
                eLoginUrl,
                apiWaitLogin: govLogins.apiWaitLogin,
                redirectURI
            });
            if (res.description.indexOf('税局升级') === -1) {
                return res;
            }
        }
        const { cityPageId } = ctx.request.query;
        const { data = {} } = opt;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        let isValidNt = true; // 有效的窗体、窗体不存在或不在发送短信界面
        // 窗体不存在
        if (!nt || !nt.nightmareWindow.win) {
            isValidNt = false;
        } else {
            // 窗体存在但不在发送短信的界面
            const stepTwoRes = await nt.evaluate(govLogins.checkIsStepTwo);
            if (!stepTwoRes || stepTwoRes.errcode !== '0000') {
                isValidNt = false;
            }
        }

        // 不是有效的窗体
        if (!isValidNt) {
            // 不需要快捷自动登录第一步
            if (data.isQuickLogin !== true) {
                return errcodeInfo.govLogout;
            }
            const checkRes = await this.stepOneLogin(opt);
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            nt = ctx.bsWindows.fpdkGovWin[cityPageId];
        }

        // 获取到的窗体为空表示处理异常
        if (!nt || !nt.nightmareWindow.win) {
            return errcodeInfo.govErr;
        }
        await nt.evaluate(govLogins.clearErr);
        await nt.click('.formContent .el-form-item__content button');
        const startTime = +new Date();
        const checkRes = await nt.wait(govLogins.checkSendResult);
        ctx.service.log.info('checkRes', (+new Date()) - startTime, checkRes);
        if (checkRes.errcode !== '0000' || checkRes.data?.errMsg) {
            const checkData = checkRes.data || {};
            const description = checkData.errMsg || '';
            if (description.indexOf('身份认证已失效') !== -1) {
                return {
                    ...errcodeInfo.govLogout,
                    description: '第一步登录已失效，请重新进行登录操作！'
                };
            }
            return {
                ...errcodeInfo.argsErr,
                description: checkRes.errcode !== '0000' ? checkData.description : checkData.errMsg
            };
        }
        return errcodeInfo.success;
    }

    // 第二步登录
    async login(opt: any) {
        const ctx = this.ctx;
        if (ctx.service.apiLogin.allowApiLogin(eUrl)) {
            const res = await ctx.service.apiLogin.secondLogin(opt, {
                eLoginUrl,
                apiWaitLogin: govLogins.apiWaitLogin,
                redirectURI
            });
            if (res.description.indexOf('税局升级') === -1) {
                return res;
            }
        }
        const { cityPageId } = ctx.request.query;
        const { data = {} } = opt;
        const { shortMsgCode = '', roleText = '', shortMsg = '' } = data;
        if (!shortMsgCode && !shortMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: '短信验证码不能为空'
            };
        }

        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[cityPageId] : null;
        if (!nt || !nt.nightmareWindow.win) {
            return errcodeInfo.govLogout;
        }
        // 检查是否在第二次登录
        const stepTwoRes = await nt.evaluate(govLogins.checkIsStepTwoOrLogin);
        ctx.service.log.info('检查是否在第二次登录状态', stepTwoRes);
        if (!stepTwoRes || stepTwoRes.errcode !== '0000') {
            return errcodeInfo.govLogout;
        }

        if (stepTwoRes && stepTwoRes.data?.isLogin) {
            // 已经跳转到业务后台
            if (stepTwoRes.data?.isFinish) {
                const res = await this.waitFinish(nt);
                return res;
            }
            const res = await this.etaxLoginSuccess(nt, opt);
            return res;
        }

        await nt.evaluate(govLogins.clearErr);
        await nt.type('input[placeholder="请输入短信验证码"]', shortMsgCode || shortMsg);
        await nt.click('.el-form .el-col-24 button');

        const startTime = +new Date();
        const selectRes = await nt.wait(govLogins.selectRole, { roleText });
        ctx.service.log.info('selectRole', selectRes, (+new Date()) - startTime);
        if (selectRes.errcode !== '0000' || selectRes.data?.errMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: selectRes.errcode !== '0000' ? selectRes.description : selectRes.data.errMsg
            };
        }
        const res = await this.etaxLoginSuccess(nt, opt);
        return res;
    }

    // 查询业务菜单的索引并保存cookie到临时的store里面
    async queryBillMenuIndex(nt: any, opt: any) {
        const ctx = this.ctx;
        const startTime = (+new Date());
        // 检测登录后跳转并获取当前账户的权限（开票和数字账户权限）
        const redirectRes = await nt.wait(govLogins.waitLoginRedirect, {
            waitTimeout: 18000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('检查登录返回', (+new Date()) - startTime, redirectRes);
        if (redirectRes.data?.isLogout) {
            return errcodeInfo.govLogout;
        }
        if (redirectRes.errcode !== '0000' || redirectRes.data?.errMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: redirectRes.errcode !== '0000' ? redirectRes.description : redirectRes.data.errMsg
            };
        }

        const { szzhCompany = '', openInvoiceCompany = '', companyName = '', companyType } = redirectRes.data || {};
        return {
            ...errcodeInfo.success,
            data: {
                companyName,
                companyType,
                openInvoiceCompany,
                szzhCompany
            }
        };
    }

    async waitFinish(nt: any) {
        const ctx = this.ctx;
        const res = await ctx.service.etaxFpdkLogin.common.waitFinish(nt, {
            eUrl,
            etaxBaseUrl
        });
        return res;
    }

    // 登录电子税局后台后的跳转
    async etaxLoginSuccess(nt: any, opt: any) {
        const ctx = this.ctx;
        const { data = {} } = opt;
        const { roleText = '' } = data;
        const menuRes = await this.queryBillMenuIndex(nt, opt);
        if (menuRes.errcode !== '0000') {
            return menuRes;
        }
        const { openInvoiceCompany, szzhCompany, companyName, companyType } = menuRes.data || {};
        const res = await ctx.service.etaxFpdkLogin.common.redirectBillModule(nt, {
            companyName,
            companyType,
            openInvoiceCompany,
            szzhCompany,
            roleText,
            eUrl,
            etaxBaseUrl
        });

        return res;
    }

    // 当前已经时登录状态，尝试进入后台
    async tryLogin(loginData: any) {
        const ctx = this.ctx;
        const { taxNo, cityPageId } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        // const { roleText = '' } = loginData;
        if (!nt || !nt.nightmareWindow.win) {
            ctx.service.log.info('tryLogin login url', eUrl);
            const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
                id: cityPageId,
                ignoreGotoError: true,
                partition: 'persist:' + cityPageId
                // session: electronSession.fromPartition('persist:' + cityPageId)
                // headers: {
                //     cookies: loginData.backendCookies
                // }
            });
            if (ntRes.errcode !== '0000') {
                return errcodeInfo.govLogout;
            }
            nt = ntRes.data;
        } else {
            await nt.goto(eUrl);
        }

        let wRes = await nt.wait(govLogins.tryLoginWait, {
            checkClickBtn: true,
            waitTimeout: 20000,
            timeoutRefresh: true
        }, 2);
        ctx.service.log.info('tryLogin wRes1', wRes);
        if (wRes.data?.selector) {
            await nt.click(wRes.data?.selector);
            wRes = await nt.wait(govLogins.tryLoginWait, {
                waitTimeout: 20000,
                timeoutRefresh: true
            }, 2);
            ctx.service.log.info('tryLogin wRes2', wRes);
        }

        if (wRes.data?.isLogined) {
            const res = await this.etaxLoginSuccess(nt, {
                data: {
                    taxNo
                },
                taxNo
            });
            return res;
        }
        return errcodeInfo.govLogout;
    }
}