import { SichuanLoginService } from './loginService/sichuan';
import { ShanghaiLoginService } from './loginService/shanghai';
import { ShanghaiV1LoginService } from './loginService/shanghai-v1';
import { ShanghaiV2LoginService } from './loginService/shanghai-v2';
import { GuangdongOldLoginService } from './loginService/guangdongv1';
import { GuangdongLoginService } from './loginService/guangdong';
import { CommonService } from './loginService/common';
import { NeimengguLoginService } from './loginService/neimenggu';
import { XiamenLoginService } from './loginService/xiamen';
import { TianjinLoginService } from './loginService/tianjin';
import { QingdaoLoginService } from './loginService/qingdao';
import { ChongqingLoginService } from './loginService/chongqing';
import { ShaanxiLoginService } from './loginService/shaanxi';
import { DalianLoginService } from './loginService/dalian';
import { ShenzhenLoginService } from './loginService/shenzhen';
import { HenanLoginService } from './loginService/henan';
import { NingboLoginService } from './loginService/ningbo';
import { FujianLoginService } from './loginService/fujian';
import { YunnanLoginService } from './loginService/yunnan';
import { LiaoningLoginService } from './loginService/liaoning';
import { JiangsuLoginService } from './loginService/jiangsu';
import { ZhejiangLoginService } from './loginService/zhejiang';
import { GansuLoginService } from './loginService/gansu';
import { JilinLoginService } from './loginService/jilin';
import { ShanxiLoginService } from './loginService/shanxi';
import { GuangxiLoginService } from './loginService/guangxi';
import { HubeiLoginService } from './loginService/hubei';
import { JiangxiLoginService } from './loginService/jiangxi';
import { HebeiLoginService } from './loginService/hebei';
import { XinjiangLoginService } from './loginService/xinjiang';
import { ShandongLoginService } from './loginService/shandong';
import { BeijingLoginService } from './loginService/beijing';
import { HunanLoginService } from './loginService/hunan';
import { AnhuiLoginService } from './loginService/anhui';
import { HainanLoginService } from './loginService/hainan';
import { GuizhouLoginService } from './loginService/guizhou';
import { XizangLoginService } from './loginService/xizang';
import { NingxiaLoginService } from './loginService/ningxia';
import { HeilongjiangLoginService } from './loginService/heilongjiang';
import { QinghaiLoginService } from './loginService/qinghai';

import { EtaxGxConfirm } from './service/etaxGxConfirm';
import { FaceCheck } from './service/faceCheck';
import { FpdkLoginService } from './service/fpdkLogin';

import { RedisLock } from './service/redisLock';
import { NtService } from './service/nt';
import { Tools } from './service/tools';
import { SwitchCompany } from './service/switchCompany';
import Ttshitu from './service/ttshitu';
import AutoLoginService from './service/autoLogin';
import { Tenant } from './service/tenant';
import { ApiLoginService } from './loginService/apiLoginService';
import { NewTime } from './loginService/newTime';
import { CheckEtaxLogin } from './service/checkEtaxLogin';
import { FpyQueryInvoices } from './service/fpyQueryInvoices';

export default {
    etaxFpdkLogin: {
        // 税局服务名称需与invoice-client-plugin-common-service\src\constant.js中的ETAX_LOGIN_OPTIONS配置的name保持一致，否则通用路由无法匹配服务
        common: CommonService,
        neimenggu: NeimengguLoginService,
        guangdongV1: GuangdongOldLoginService,
        guangdong: GuangdongLoginService,
        shanghai: ShanghaiLoginService,
        shanghaiV1: ShanghaiV1LoginService,
        shanghaiV2: ShanghaiV2LoginService,
        sichuan: SichuanLoginService,
        xiamen: XiamenLoginService,
        tianjin: TianjinLoginService,
        qingdao: QingdaoLoginService,
        chongqing: ChongqingLoginService,
        shenzhen: ShenzhenLoginService,
        henan: HenanLoginService,
        ningbo: NingboLoginService,
        fujian: FujianLoginService,
        shaanxi: ShaanxiLoginService,
        yunnan: YunnanLoginService,
        liaoning: LiaoningLoginService,
        dalian: DalianLoginService,
        jiangsu: JiangsuLoginService,
        zhejiang: ZhejiangLoginService,
        gansu: GansuLoginService,
        jilin: JilinLoginService,
        hubei: HubeiLoginService,
        shanxi: ShanxiLoginService,
        guangxi: GuangxiLoginService,
        jiangxi: JiangxiLoginService,
        hebei: HebeiLoginService,
        xinjiang: XinjiangLoginService,
        shandong: ShandongLoginService,
        beijing: BeijingLoginService,
        hunan: HunanLoginService,
        anhui: AnhuiLoginService,
        hainan: HainanLoginService,
        guizhou: GuizhouLoginService,
        ningxia: NingxiaLoginService,
        heilongjiang: HeilongjiangLoginService,
        xizang: XizangLoginService,
        qinghai: QinghaiLoginService
    },
    newTime: NewTime,
    etaxGxConfirm: EtaxGxConfirm,
    faceCheck: FaceCheck,
    switchCompany: SwitchCompany,
    redisLock: RedisLock,
    nt: NtService,
    tools: Tools,
    fpdkLogin: FpdkLoginService,
    ttshitu: Ttshitu,
    autoLogin: AutoLoginService,
    tenant: Tenant,
    apiLogin: ApiLoginService,
    checkEtaxLogin: CheckEtaxLogin,
    fpyQueryInvoices: FpyQueryInvoices
};