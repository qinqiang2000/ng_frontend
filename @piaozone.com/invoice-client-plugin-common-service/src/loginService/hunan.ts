import * as govLogins from '../govLoginLibs/hunan';

const eUrl = 'https://etax.hunan.chinatax.gov.cn';
const etaxBaseUrl = 'https://dppt.hunan.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.hunan.chinatax.gov.cn/wsbs/toLogin.do';
const redirectURI = 'https://etax.hunan.chinatax.gov.cn/wsbs/toLogin.do';

export class HunanLoginService extends BaseService {
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
        await nt.type('input[placeholder="个人用户密码"]', accountPasswd);
        ctx.service.log.info('type', (+new Date()) - startTime);

        const inputErr = await nt.evaluate(govLogins.checkInputErr, data);
        // 输入有误，重复输入
        if (inputErr === true) {
            if (retry > 2) {
                ctx.service.log.info('输入账户信息三次重试后任然异常');
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
        ctx.service.log.info('plugin service-----------------');
        const { data = {} } = opt;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }

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
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }

        // 直接登录成功
        if (checkRes.data?.isLogin) {
            const res = await this.etaxLoginSuccess(nt, opt);
            return res;
        }

        const phone = checkRes.data?.phone || '';
        return {
            ...errcodeInfo.success,
            data: phone
        };
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
        // 窗体不存在
        if (!nt || !nt.nightmareWindow.win) {
            // 非快捷登录
            if (data.isQuickLogin !== true) {
                return errcodeInfo.govLogout;
            }
            // 自动登录第一步
            const resStepOne = await this.stepOneLogin({ data });
            if (resStepOne.errcode !== '0000') {
                return resStepOne;
            }
            nt = ctx.bsWindows.fpdkGovWin[cityPageId];
        }

        let startTime = +new Date();
        // 检查是否在第二次登录
        const stepTwoRes = await nt.evaluate(govLogins.checkIsStepTwo);
        ctx.service.log.info('检查是否在第二次登录状态', (+new Date()) - startTime, stepTwoRes);
        if (!stepTwoRes || stepTwoRes.errcode !== '0000') {
            // 非快捷登录
            if (data.isQuickLogin !== true) {
                return errcodeInfo.govLogout;
            }
            // 自动登录第一步
            const resStepOne = await this.stepOneLogin({ data });
            if (resStepOne.errcode !== '0000') {
                return resStepOne;
            }
            nt = ctx.bsWindows.fpdkGovWin[cityPageId];
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
        await nt.click('.formContent .el-form-item__content button');
        startTime = +new Date();
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
        const stepTwoRes = await nt.evaluate(govLogins.checkIsStepTwo);
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
        }, 1);
        ctx.service.log.info('检查登录返回', (+new Date()) - startTime, redirectRes);
        if (redirectRes.data?.isLogout) {
            return errcodeInfo.govLogout;
        }

        if (redirectRes.data?.errMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: redirectRes.data.errMsg
            };
        }

        const { szzhCompany = 1, openInvoiceCompany = 1, companyName = '', companyType = '03' } = redirectRes.data || {};
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
            const ntRes = await ctx.service.ntTools.getEtaxPage(eUrl, {
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
