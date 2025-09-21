// import errcodeInfo from '$client/errcodeInfo';
// import { BaseService } from './baseService';
import { waitLogin, initPage, inputLogins } from '../govLibs-zf/login';
// import pwyStore from '$client/electronStore';
// import { zfLoginedCachePreKey, companyZfbasePreKey } from '$client/fpdk-gov/constant';
import { getSwjgInfoByTaxNo, getSwjgInfoByCity } from '../utils/swjgInfo';

// 登录综合服务平台缓存前缀规则
const zfLoginedCachePreKey = 'company-zf-login-info-';
// 企业的信息的配置保存：cache 前缀 + 企业税号
const companyZfbasePreKey = 'company-zf-base-info-';

export class FpdkLoginService extends BaseService {
    checkDiskLoginArgs(taxNo: string, requestBody: any) {
        const ctx = this.ctx;
        const companyBaseInfo = pwyStore.get(companyZfbasePreKey + taxNo) || {};
        let govCity = requestBody.govCity || companyBaseInfo.govCity || '';
        let caPassword = requestBody.caPassword || companyBaseInfo.caPassword || '';
        const ptPassword = requestBody.ptPassword || companyBaseInfo.ptPassword || '';

        // eas 星空旧版本会传caPass和city，如果本地和body里面都没有上面的参数就使用这里的参数
        if (govCity === '' && requestBody.city) {
            govCity = requestBody.city;
        }

        if (!caPassword && requestBody.caPass) {
            caPassword = requestBody.caPass;
        }

        let cityInfo;

        if (!caPassword) {
            ctx.service.log.info('税盘证书密码未配置!');
            return {
                ...errcodeInfo.argsErr,
                description: '请先设置金税盘、税控盘或税务Ukey证书密码!'
            };
        }

        if (govCity !== '') {
            cityInfo = getSwjgInfoByCity(govCity);
        }

        if (!cityInfo) {
            cityInfo = getSwjgInfoByTaxNo(taxNo);
        }

        if (!cityInfo) {
            ctx.service.log.info('通过税号和配置的城市都为找到对应税局地址', govCity, taxNo);
            return {
                errcode: '3000',
                description: '税号参数错误，请检查！'
            };
        }
        return {
            ...errcodeInfo.success,
            data: {
                cityInfo,
                caPassword,
                ptPassword,
                govCity
            }
        };
    }

    // 税盘登录
    async diskLogin(taxNo: string) {
        const ctx = this.ctx;

        const checkRes : any = this.checkDiskLoginArgs(taxNo, ctx.request.body);
        ctx.service.log.info('checkRes', checkRes);
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const { cityInfo, caPassword, ptPassword } = checkRes.data;
        const res = await ctx.service.ntTools.getEtaxPage(cityInfo.url, { id: taxNo });
        if (res.errcode !== '0000') {
            return res;
        }
        const nt = res.data;
        let loginRes;
        try {
            await nt.wait(initPage);
            await nt.wait(2000);
            await nt.evaluate(inputLogins, { caPassword, ptPassword });
            const curUrl1 = nt.getUrl();
            ctx.service.log.info('111111111----------------', curUrl1);
            await nt.click('#submit');
            // 调试增加5秒延迟
            await nt.wait(5000);
            // const urlTest = await nt.wait(getUrl, { waitTimeout: 10 * 1000 });
            const curUrl2 = nt.getUrl();
            ctx.service.log.info('22222222222222----------------', curUrl2);
            loginRes = await nt.wait(waitLogin, { waitTimeout: 60 * 1000 });
            const { errcode, data = {}, description } = loginRes;
            ctx.service.log.info('loginRes----------------', loginRes);
            if (nt) {
                ctx.service.ntTools.screenshotAndUpload(nt);
            }
            const errMsg = data.errMsg || '';
            if (errMsg.indexOf('加载税务安全证书应用客户端') !== -1) {
                return errcodeInfo.diskConnectRefused;
            }

            if (errMsg.indexOf('验证口令失败') !== -1) {
                return errcodeInfo.caPasswordError;
            }

            if (errcode !== '0000' || errMsg) {
                // 数电票用票试点纳税人 优化对应的提示
                if (~errMsg.indexOf('试点纳税人')) {
                    return {
                        ...errcodeInfo.govErr,
                        description: '您当前为数电票用票试点纳税人，请关注金蝶发票云公众号，点击下方的升级数电，根据指引进行操作，感谢您的理解！'
                    };
                }
                return {
                    ...errcodeInfo.govErr,
                    description: data.errMsg || description
                };
            }
            const userData = {
                ...loginRes.data,
                taxNo
            };
            ctx.service.log.info('diskLogin----userData', userData);
            pwyStore.set(zfLoginedCachePreKey + taxNo, userData, 2 * 60 * 60);
            this.clearOldCaches(userData);
            return {
                ...errcodeInfo.success,
                data: userData
            };
        } catch (error) {
            ctx.service.log.info('登录异常', error);
            ctx.service.log.info('登录异常, 返回值', loginRes);
            return errcodeInfo.govErr;
        }
    }


    clearOldCaches(userData : any = {}) {
        const ctx = this.ctx;
        const { taxNo, skssq = '' } = userData;
        const curTaxPeriod = skssq.substr(0, 6);
        // 当前统计表缓存需要清理，防止客户到税局操作导致统计表不一致
        const cacheFilePath = ctx.service.tools.getCachePath(taxNo, 'dqtjcx_' + curTaxPeriod);
        ctx.service.tools.clearCacheFile(cacheFilePath);
        return true;
    }

    async secondLogin(userInfo: any, requestBody: any) {
        const ctx = this.ctx;
        const taxNo = userInfo.taxNo;
        const cacheInfo = pwyStore.get(zfLoginedCachePreKey + taxNo);
        return {
            ...errcodeInfo.success,
            data: {
                companyType: cacheInfo.companyType,
                companyName: cacheInfo.companyName,
                skssq: cacheInfo.skssq,
                gxrqfw: cacheInfo.gxrqfw,
                baseUrl: cacheInfo.baseUrl
            }
        };
    }

    getSkssq(requestBody: any) {
        const taxNo = requestBody.taxNo;
        const cacheInfo = pwyStore.get(zfLoginedCachePreKey + taxNo);
        if (!cacheInfo || !cacheInfo.gxrqfw) {
            return {
                ...errcodeInfo.govLogout,
                description: '登录信息失效，请重新登录'
            };
        }
        return {
            ...errcodeInfo.success,
            data: {
                skssq: cacheInfo.skssq,
                gxrqfw: cacheInfo.gxrqfw
            }
        };
    }
}