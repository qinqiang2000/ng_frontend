/* eslint-disable no-undef,no-unused-vars */
import * as govLogins from '../govLoginLibs/dalian';
import { sleep } from '../utils/tools';

const eUrl = 'https://etax.dalian.chinatax.gov.cn';
const etaxBaseUrl = 'https://dppt.dalian.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.dalian.chinatax.gov.cn/cas/login';
const redirectURI = `${eUrl}/cas/loginSubmit?service=${eUrl}/cas/login?service=${eUrl}/shiro-cas`;

export class DalianLoginService extends BaseService {
    // 提取验证码并识别，重试三次
    async autoDragYzm(nt: any, retry = 1): Promise<any> {
        const ctx = this.ctx;

        if (retry > 3) {
            ctx.service.log.info('autoDragYzm 错误超过', retry - 1, '次');
            return {
                ...errcodeInfo.argsErr,
                description: '登录异常，请稍后再试！'
            };
        }

        // 隐藏验证码
        await nt.evaluate(govLogins.hideDragYzm);

        // 点击登录按钮 显示验证码
        await sleep(300);
        await nt.click('.el-form button:last-child');

        // 获取验证码
        let image = '';
        let imageback = '';
        try {
            const res = await nt.wait(govLogins.queryYzm);
            if (res.errcode !== '0000') {
                return res;
            }
            const resData = res.data || {};
            image = (resData.image || '').replace(/^data:image\/.*?;base64,/, '');
            imageback = (resData.imageback || '').replace(/^data:image\/.*?;base64,/, '');
        } catch (infoErr) {
            return {
                errcode: '5000',
                description: '税局请求异常，请稍后再试！'
            };
        }

        // 验证码识别
        const res = await ctx.service.ttshitu.getSliderPosition(image, imageback);
        if (res.errcode !== '0000') {
            ctx.service.log.info('识别错误', retry, '次', res);
            return await this.autoDragYzm(nt, retry + 1);
        }

        // 拖拽按钮
        const startTime = +new Date();
        await nt.wait(govLogins.drayBtn, {
            waitTimeout: 5000,
            x: Number(res.data.x)
        });
        ctx.service.log.info('drayBtn', retry, '次', (+new Date()) - startTime);

        // 清除登录提示
        await sleep(300);
        await nt.evaluate(govLogins.clearErr);
        try {
            // 拖转登录结果
            const checkRes = await nt.wait(govLogins.checkStepOneLogin);
            ctx.service.log.info('checkStepOneLogin', retry, '次', checkRes);
            const checkData : any = checkRes.data || {};
            // 登录错误
            if (checkRes.errcode !== '0000') {
                return {
                    ...errcodeInfo.argsErr,
                    description: checkData.description
                };
            }
            // 拖拽错误
            if (checkData?.errMsg === 'slideVerify') {
                ctx.service.log.info('拖拽错误', retry, '次');
                await sleep(1000);
                return await this.autoDragYzm(nt, retry + 1);
            }
            // 其它错误
            if (checkData?.errMsg) {
                return {
                    ...errcodeInfo.argsErr,
                    description: checkData.errMsg
                };
            }
            if (checkData) {
                // 切换短信登录并获取手机号
                await nt.click('.formContent .tabsCls .justifyCenterEnd > div:nth-child(3) > span');
                const resPhone = await nt.wait(govLogins.getPhoneNumber);
                return resPhone;
            }
            return checkRes;
        } catch (error) {
            ctx.service.log.info('第一步登录异常', error.toString());
            return {
                ...errcodeInfo.govErr,
                description: '登录异常，请稍后再试！'
            };
        }
    }

    // 输入
    async stepOneTypes(nt: any, data : any = {}, retry = 0) {
        const ctx = this.ctx;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        if (!taxNo || !account || !accountPasswd) {
            return errcodeInfo.argsErr;
        }
        let startTime = (+new Date());
        let checkRes;
        try {
            const initRes = await nt.wait(govLogins.chooseLoginVersion, {
                waitTimeout: 15000,
                timeoutRefresh: true
            }, 2);

            ctx.service.log.info('init', (+new Date()) - startTime, initRes);
            if (initRes.errcode !== '0000') {
                return initRes;
            }
            // 已登录
            if (initRes.data?.isLogin) {
                const resLogin = await this.etaxLoginSuccess(nt, { data });
                return resLogin;
            }
            // 输入账户信息
            startTime = +new Date();
            await nt.type('input[placeholder="统一社会信用代码/纳税人识别号"]', taxNo);
            await nt.type('input[placeholder="居民身份证号码/手机号码/用户名"]', account);
            await nt.type('input[placeholder="个人用户密码(初始密码为证件号码后六位)"]', accountPasswd);
            ctx.service.log.info('type', (+new Date()) - startTime);
            await sleep(300);
            const inputErr = await nt.evaluate(govLogins.checkInputErr, data);
            // 输入有误，重复输入
            if (inputErr === true) {
                if (retry > 2) {
                    return errcodeInfo.govErr;
                }
                const res : any = await this.stepOneTypes(nt, data, retry + 1);
                return res;
            }

            // 点击登录并获取第一步登录结果
            startTime = +new Date();
            checkRes = await this.autoDragYzm(nt);
            ctx.service.log.info('autoDragYzm', checkRes, (+new Date()) - startTime);
        } catch (error) {
            ctx.service.log.info('第一步登录异常', error.toString());
            return {
                ...errcodeInfo.govErr,
                description: '登录异常，请稍后再试！'
            };
        }
        return checkRes;
    }

    // 第一步登录
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

        const { data = {} } = opt;
        const { taxNo = '', account = '', accountPasswd = '' } = data;
        ctx.service.log.info('---stepOneLogin---');
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

        await nt.click('.formContent .el-form-item__content button');
        await nt.evaluate(govLogins.clearErr);
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

    // 查询业务菜单的索引并保存cookie到临时的store里面
    async queryBillMenuIndex(nt: any, opt: any) {
        const ctx = this.ctx;
        const startTime = (+new Date());
        // 检测登录后跳转并获取当前账户的权限（开票和数字账户权限）
        const redirectRes = await nt.wait(govLogins.waitLoginRedirect, {
            waitTimeout: 10000,
            timeoutRefresh: true
        }, 3);
        ctx.service.log.info('检查登录返回', (+new Date()) - startTime, redirectRes);
        if (redirectRes.data?.isLogout) {
            return errcodeInfo.govLogout;
        }
        if (redirectRes.errcode !== '0000' || (redirectRes.data && redirectRes.data.errMsg)) {
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

    // 获取电子税局结果
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
        const { openInvoiceCompany, szzhCompany, companyName = '', companyType } = menuRes.data || {};
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
        if (selectRes.errcode !== '0000' || (selectRes.data && selectRes.data.errMsg)) {
            return {
                ...errcodeInfo.argsErr,
                description: selectRes.errcode !== '0000' ? selectRes.description : selectRes.data.errMsg
            };
        }
        const res = await this.etaxLoginSuccess(nt, opt);
        return res;
    }

    // 当前已经时登录状态，尝试进入后台
    async tryLogin(loginData: any) {
        const ctx = this.ctx;
        const { taxNo, cityPageId } = ctx.request.query;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[cityPageId] : null;
        const { roleText = '' } = loginData;
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
