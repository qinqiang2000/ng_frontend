
/* eslint-disable no-undef,no-unused-vars */
import * as govLogins from '../govLoginLibs/shanghai-v1';

const eUrl = 'https://etax.shanghai.chinatax.gov.cn';
const etaxBaseUrl = 'https://dppt.shanghai.chinatax.gov.cn:8443';
const eLoginUrl = 'https://etax.shanghai.chinatax.gov.cn/wszx-web/bszm/apps/views/beforeLogin/indexBefore/pageIndexFromKX.html#/';

export class ShanghaiV1LoginService extends BaseService {
    // 提取验证码并识别，重试三次
    async autoClickYzm(nt: any, retry = 1): Promise<any> {
        const ctx = this.ctx;
        let base64Str = '';
        let remark = '';
        try {
            await nt.click('.login-btn');
            const refresh = retry !== 1;
            const res = await nt.wait(govLogins.queryYzm, {
                refresh
            });
            if (res.errcode !== '0000') {
                return res;
            }
            const resData = res.data || {};
            base64Str = resData.yzmBase64 || '';
            base64Str = base64Str.replace(/^data:image\/.*?;base64,/, '');
            remark = resData.remark || '';
        } catch (infoErr) {
            return {
                errcode: '5000',
                description: '税局请求异常，请稍后再试！'
            };
        }

        const res = await ctx.service.ttshitu.getQuickClickPosition(base64Str, remark);
        if (res.errcode !== '0000' || res.data.length < 4) {
            if (retry > 3) {
                ctx.service.log.info('点选验证识别错误超过', retry, '次', res);
                return {
                    ...errcodeInfo.argsErr,
                    description: '登录异常，请稍后再试！'
                };
            }
            return await this.autoClickYzm(nt, retry + 1);
        }

        const clickRes = await nt.wait(govLogins.clickSelectYzm, {
            clickArr: res.data
        });

        if (clickRes.errcode !== '0000') {
            return clickRes;
        }

        const resData = clickRes.data || {};
        // 验证码错误重新查验验证码返回
        if (resData.status === 'yzmErr') {
            if (retry > 3) {
                ctx.service.log.info('点选验证顺序识别错误');
                return {
                    ...errcodeInfo.argsErr,
                    description: '登录异常，请稍后再试！'
                };
            }
            return await this.autoClickYzm(nt, retry + 1);
        }
        return clickRes;
    }

    // 选择登录账号-检查参数
    checkArgs(data: any = {}, requsetTaxNo: string) {
        const {
            taxNo,
            accountPasswd,
            realLoginType
        } = data;

        if (!taxNo || !accountPasswd) {
            return {
                ...errcodeInfo.argsErr,
                description: '账号信息不全，请检查'
            };
        }

        if (requsetTaxNo !== taxNo) {
            return {
                errcode: '0001',
                description: '当前企业信息与税局账号不一致'
            };
        }

        if (realLoginType !== 1 && realLoginType !== 2) {
            return {
                ...errcodeInfo.argsErr,
                description: '登录方式参数错误，请检查'
            };
        }

        return errcodeInfo.success;
    }

    // 第二步登录
    async secondStepLogin(opt: any = {}) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { data = {} } = opt;
        const { realLoginType, shortMsgCode, realUserPassword, shortMsg = '' } = data;

        const nt = ctx.bsWindows.fpdkGovWin[pageId];

        if (realLoginType === 1) {
            if (!realUserPassword) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '实名用户密码不能为空'
                };
            }
            await nt.click('.ant-modal-body .ant-radio-group label:first-child');
            await nt.wait(300);
            await nt.type('#passwordZrr', realUserPassword);
            await nt.click('.ant-modal-body .user-login button:last-child');
        } else if (realLoginType === 2) {
            if (!shortMsgCode && !shortMsg) {
                return {
                    ...errcodeInfo.argsErr,
                    description: '短信验证码不能为空'
                };
            }
            await nt.click('.ant-modal-body .ant-radio-group label:first-child + label');
            await nt.wait(300);
            await nt.type('#code', shortMsgCode || shortMsg);
        }
        await nt.click('.ant-modal-body .user-login .ant-btn-primary:last-child');
        return errcodeInfo.success;
    }

    // 查询账号信息
    async queryUserList(opt: any = {}) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { data = {} } = opt;

        const { taxNo, accountPasswd, roleText = '' } = data;
        if (!taxNo || !accountPasswd) {
            return {
                errcode: '0001',
                description: '税号与密码都不能为空'
            };
        }

        // 打开税局
        const startTime = +new Date();
        const ntRes = await ctx.service.ntTools.getEtaxPage(eLoginUrl, {
            id: pageId,
            partition: pageId + roleText + (+new Date())
        });
        ctx.service.log.info('open nt', (+new Date()) - startTime);
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        const nt = ntRes.data;

        const checkRes = await this.stepOneTypes(nt, data);
        return checkRes;
    }

    // 输入
    async stepOneTypes(nt: any, data: any = {}, retry = 0) {
        const ctx = this.ctx;
        const { taxNo = '', accountPasswd = '' } = data;
        if (!taxNo || !accountPasswd) {
            return {
                errcode: '0001',
                description: '税号与密码都不能为空'
            };
        }
        let startTime = +new Date();
        try {
            const resInit = await nt.wait(govLogins.loginInitWait);
            ctx.service.log.info('init', (+new Date()) - startTime, resInit);
            if (resInit.errcode !== '0000') {
                return resInit;
            }
            // 已登录
            if (resInit.data?.isLogin) {
                const resLogin = await this.etaxLoginSuccess(nt, { data });
                return resLogin;
            }
            startTime = +new Date();
            await nt.type('#userName', taxNo);
            await nt.type('#passWord', accountPasswd);
            ctx.service.log.info('type', (+new Date()) - startTime);
            const inputErr = await nt.evaluate(govLogins.checkInputErr, data);
            // 输入有误，重复输入
            if (inputErr === true) {
                if (retry > 2) {
                    return errcodeInfo.govErr;
                }
                const res: any = await this.stepOneTypes(nt, data, retry + 1);
                return res;
            }

            const res = await this.autoClickYzm(nt);
            ctx.service.log.info('autoClickYzm', res);
            if (res.errcode !== '0000') {
                return res;
            }
            // 开始首次登录验证
            await nt.click('.user-login button');
            // 选择实名身份进行二次登录
            await nt.wait(1000);
            const userListRes = await nt.wait(govLogins.getUserList);
            if (userListRes.errcode !== '0000') {
                return userListRes;
            }
            if (userListRes.data && userListRes.data.errMsg) {
                return {
                    ...errcodeInfo.argsErr,
                    description: userListRes.data.errMsg
                };
            }
            return {
                ...errcodeInfo.success,
                data: userListRes.data
            };
        } catch (error) {
            ctx.service.log.info('第一步登录异常', error.toString());
            return {
                ...errcodeInfo.govErr,
                description: '登录异常，请稍后再试！'
            };
        }
    }

    // 选择登录账号
    async selectLoginAccount(opt: any = {}, name: string) {
        const ctx = this.ctx;
        const { pageId, taxNo: requsetTaxNo } = ctx.request.query;
        const { data = {} } = opt;

        // 检查参数
        const checkRes = this.checkArgs(data, requsetTaxNo);
        if (checkRes.errcode !== '0000') {
            ctx.service.log.info(`${name} 检查参数`, checkRes);
            return checkRes;
        }

        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[pageId] : null;
        if (!nt || !nt.nightmareWindow.win) {
            // 自动登录第一步
            const resStepOne = await this.queryUserList(opt);
            if (resStepOne.errcode !== '0000') {
                return resStepOne;
            }
            nt = ctx.bsWindows.fpdkGovWin[pageId];
        }

        // 检查登录步骤
        const stepTwoRes = await nt.evaluate(govLogins.checkIsStepTwo);
        ctx.service.log.info(`${name} 检查登录步骤`, stepTwoRes);
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

        // 选择登录账号
        const { realUserName } = data;
        await nt.wait(300);
        const userRes = await nt.wait(govLogins.selectUserName, { name: realUserName });
        if (userRes.errcode !== '0000') {
            ctx.service.log.info(`${name} 选择登录账号`, userRes, realUserName);
            return userRes;
        }
        if (userRes.data && userRes.data.errMsg) {
            return {
                ...errcodeInfo.argsErr,
                description: userRes.data.errMsg
            };
        }

        return {
            ...errcodeInfo.success,
            nt
        };
    }

    // 选择登录方式
    async selectLoginType(opt: any = {}) {
        const ctx = this.ctx;
        const { data = {} } = opt;

        // 选择登录账号
        const accountRes = await this.selectLoginAccount(opt, '选择登录方式');
        if (accountRes.errcode !== '0000') {
            return accountRes;
        }
        const nt = accountRes.nt;

        const { realLoginType } = data;
        let res;
        // 传了登录方式，支持1,2
        if (realLoginType === 1) {
            await nt.click('.ant-modal-body .ant-radio-group label:first-child');
        } else if (realLoginType === 2) {
            await nt.click('.ant-modal-body .ant-radio-group label:first-child + label');
            res = await nt.wait(govLogins.getPhoneNo);
            ctx.service.log.info('获取手机号', res);
            if (res.errcode !== '0000') {
                return res;
            }
            if (res.data && res.data.errMsg) {
                return {
                    ...errcodeInfo.argsErr,
                    description: res.data.errMsg
                };
            }
        }
        return res || errcodeInfo.success;
    }

    // 发送短信验证码
    async sendShortMsg(opt: any = {}) {
        // 选择登录账号
        const accountRes = await this.selectLoginAccount(opt, '发送短信验证码');
        if (accountRes.errcode !== '0000') {
            return accountRes;
        }
        const nt = accountRes.nt;

        // 选择发送短信类型
        await nt.click('.ant-modal-body .ant-radio-group label:first-child + label');
        await nt.wait(300);
        // 发送短信
        await nt.click('.ant-modal-body .user-login .getcode');
        await nt.wait(1000);
        const res = nt.wait(govLogins.waitSendShortMsg);
        return res;
    }

    // 登录
    async login(opt: any = {}) {
        const ctx = this.ctx;
        ctx.service.log.info('登录 start');

        // 选择登录账号
        const accountRes = await this.selectLoginAccount(opt, '登录');
        if (accountRes.errcode !== '0000') {
            return accountRes;
        }
        const nt = accountRes.nt;

        // 第二步登录
        const loginRes = await this.secondStepLogin(opt);
        if (loginRes.errcode !== '0000') {
            ctx.service.log.info('第二步登录', loginRes);
            return loginRes;
        }

        ctx.service.log.info('登录 end');
        return await this.etaxLoginSuccess(nt, opt);
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
        const { pageId } = ctx.request.query;
        const { data = {} } = opt;
        const { roleText = '', realPageId = pageId } = data;

        const menuRes = await ctx.service.etaxFpdkLogin.shanghaiV2.queryBillMenuIndex(nt, opt);
        if (menuRes.errcode !== '0000') {
            return menuRes;
        }
        // 实际需存储的realPageId与realLoginAccountUid
        if (pageId !== realPageId) {
            const loginData = await pwyStore.set(etaxLoginedCachePreKey + pageId);
            await pwyStore.set(etaxLoginedCachePreKey + realPageId, loginData, 12 * 60 * 60);
        }
        const { openInvoiceCompany, szzhCompany } = menuRes.data || {};
        const res = await ctx.service.etaxFpdkLogin.common.redirectBillModule(nt, {
            openInvoiceCompany,
            szzhCompany,
            roleText,
            eUrl,
            etaxBaseUrl
        }, {
            pageId: realPageId
        });
        return res;
    }
}