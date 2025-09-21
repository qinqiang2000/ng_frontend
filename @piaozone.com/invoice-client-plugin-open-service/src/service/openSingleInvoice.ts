/* eslint-disable prefer-rest-params,complexity */
import { fixedFloatNumber, clearChars } from '$utils/tools';
import { etaxZzstsgl } from '../constant';
import { getUUId, generateSpecificId } from '$utils/getUid';
import { etaxLoginedCachePreKey } from '$client/constant';
import { SpecificInfoOptions } from '$client/validate/etaxOpen';
import { Add, Minus, accDiv, toFixedNoZero } from '$utils/index';
import { simulateClick } from '../libs/randomClick';

export class OpenSingleInvoice extends BaseService {
    createItems(originData: any) {
        const { items: originItem = [], differenceTaxType, reductionTaxType, taxFlag } = originData;
        const result = [];
        for (let i = 0; i < originItem.length; i++) {
            const curOriginItem = originItem[i];
            const discountType = curOriginItem.discountType + '';
            const goodsName = curOriginItem.goodsName + '';
            let xmmc = goodsName;
            const spfwjc = goodsName.split('*')[1] || '';
            const jcIndex = goodsName.indexOf('*', 1);
            if (jcIndex !== -1) {
                xmmc = goodsName.substring(jcIndex + 1);
            }
            let SsyhzclxDm = '';
            const { vatException } = curOriginItem;

            // 数电增值税特殊管理
            const zzstsgl = etaxZzstsgl.find((item) => item.value === vatException || item.label === vatException);
            SsyhzclxDm = zzstsgl?.value || SsyhzclxDm;

            // 优惠政策标志
            const Xsyhzcbz = SsyhzclxDm ? 'Y' : 'N';

            // 征收方式代码TdzsfsDm 默认为空
            // 差额征税与减按征税不能同时设置
            // 差额征税与减按征税时无需判断明细的优惠政策类型
            let TdzsfsDm = '';
            if (differenceTaxType) {
                // 差额征税
                TdzsfsDm = '03';
            } else if (reductionTaxType) {
                // 减按征税
                TdzsfsDm = '06';
            } else if (SsyhzclxDm === '04') {
                // 不征税
                TdzsfsDm = '01';
            } else if (SsyhzclxDm === '03') {
                // 免税
                TdzsfsDm = '04';
            } else if (+curOriginItem.taxRate === 0) {
                // 普通零税率
                // 免税与不征税时的税率也为0要排除，因此在它两后面判断
                TdzsfsDm = '02';
            } else if (SsyhzclxDm === '01' || SsyhzclxDm === '08' || SsyhzclxDm === '09') {
                // 01简易征收 08按3%简易征收 09按5%简易征收
                // 10按5%简易征收减按1.5%计征 属于减按征税
                TdzsfsDm = '05';
            }

            let Bhsdj;
            let Bhsje;
            let Hsdj;
            let Hsje;
            if (taxFlag === 0) {
                // 不含税
                Bhsdj = parseFloat(curOriginItem.unitPrice || 0);
                Bhsje = parseFloat(curOriginItem.detailAmount);
                Hsje = Add(curOriginItem.detailAmount, curOriginItem.taxAmount);
                Hsdj = curOriginItem.unitPrice ? parseFloat(toFixedNoZero(accDiv(Hsje, curOriginItem.num)).substring(0, 16)) : '';
            } else {
                // 含税
                Bhsje = Minus(curOriginItem.detailAmount, curOriginItem.taxAmount);
                Bhsdj = curOriginItem.unitPrice ? parseFloat(toFixedNoZero(accDiv(Bhsje, curOriginItem.num)).substring(0, 16)) : '';
                Hsdj = parseFloat(curOriginItem.unitPrice || 0);
                Hsje = parseFloat(curOriginItem.detailAmount);
            }

            // 正常明细行
            if (discountType === '0') {
                // 后台数据需要传不含税明细金额
                result.push({
                    Xh: i + 1,
                    FphxzDm: discountType, // 行类型
                    Zkxh1: 0,
                    Xmmc: xmmc,
                    Fullxmmc: '',
                    Hwhyslwfwmc: goodsName,
                    Sphfwssflhbbm: curOriginItem.goodsCode || '', // 税收分类编码
                    Spfwjc: spfwjc, // 简称
                    Ggxh: curOriginItem.specModel || '',
                    Dw: curOriginItem.unit || '',
                    Spsl: curOriginItem.num ? parseFloat(curOriginItem.num) : '', // number
                    Dj: curOriginItem.unitPrice ? parseFloat(curOriginItem.unitPrice) : '',
                    Je: parseFloat(curOriginItem.detailAmount), // number
                    Hsje, // 含税金额
                    Slv: curOriginItem.taxRate + '', // 税率，税局字符串
                    Se: parseFloat(curOriginItem.taxAmount), // number
                    Kce: curOriginItem.deduction || 0, // 扣除额
                    Jzjtbl: '', // 即征即退比例
                    Jzjtcsfl: '', // 即征即退csfl
                    Lslbz: '', // 零税率标识
                    Xsyhzcbz, // 优惠政策标志
                    SsyhzclxDm, // 税收优惠政策类型代码
                    Zzstsgl: '',
                    TdyslxDm: '',
                    TdzsfsDm, // 征收方式代码
                    ZspmDm: '',
                    ZzszcyjDm: '',
                    Hzfpdylzfpmxxh: '',
                    Hsdj, // 含税单价
                    Bhsdj, // 不含税单价
                    Bhsje, // 不含税金额
                    Zkje: curOriginItem.discountAmount ? parseFloat(curOriginItem.discountAmount) : '', // 正常行才有折扣额 被折扣行无需处理
                    SlvOptions: [
                        {
                            Label: curOriginItem.taxRate * 100 + '%',
                            Value: curOriginItem.taxRate + ''
                        }
                    ],
                    AutoSlv: '',
                    Bcmsbz: '',
                    JzjtlxDm: curOriginItem.taxFreeType || '', // 即征即退类型代码
                    Slvbcbz: null,
                    Fylb: '',
                    Zfbl: '',
                    Slqdbz: 'Y',
                    Sl: curOriginItem.num || '', // 数量，税局为string
                    Jdctzclsbdhuuid: '', // 机动车uuid
                    AutofocusObject: {}
                });
            // 被折扣行
            } else if (discountType === '2') {
                result.push({
                    Xh: i + 1,
                    FphxzDm: discountType,
                    Zkxh1: 0,
                    Xmmc: xmmc,
                    Fullxmmc: '',
                    Hwhyslwfwmc: goodsName,
                    Sphfwssflhbbm: curOriginItem.goodsCode || '', // 税收分类编码
                    Spfwjc: spfwjc, // 简称
                    Ggxh: curOriginItem.specModel || '',
                    Dw: curOriginItem.unit || '',
                    Spsl: curOriginItem.num ? parseFloat(curOriginItem.num) : '', // number
                    Dj: curOriginItem.unitPrice ? parseFloat(curOriginItem.unitPrice) : '',
                    Je: parseFloat(curOriginItem.detailAmount), // number
                    Hsje, // 含税金额
                    Slv: curOriginItem.taxRate + '', // 税率，税局字符串
                    Se: parseFloat(curOriginItem.taxAmount), // number
                    Kce: curOriginItem.deduction || 0, // 扣除额
                    Jzjtbl: '', // 即征即退比例
                    Jzjtcsfl: '', // 即征即退csfl
                    Lslbz: '', // 零税率标识
                    Xsyhzcbz, // 优惠政策标志
                    SsyhzclxDm, // 税收优惠政策类型代码
                    Zzstsgl: '',
                    TdyslxDm: '',
                    TdzsfsDm, // 征收方式代码
                    ZspmDm: '',
                    ZzszcyjDm: '',
                    Hzfpdylzfpmxxh: '',
                    Hsdj, // 含税单价
                    Bhsdj, // 不含税单价
                    Bhsje, // 不含税金额
                    Zkje: '', // 正常行才有折扣额 被折扣行无需处理
                    SlvOptions: [
                        {
                            Label: curOriginItem.taxRate * 100 + '%',
                            Value: curOriginItem.taxRate + ''
                        }
                    ],
                    AutoSlv: '',
                    Bcmsbz: '',
                    JzjtlxDm: curOriginItem.taxFreeType || '', // 即征即退类型代码
                    Slvbcbz: null,
                    Fylb: '',
                    Zfbl: '',
                    Slqdbz: 'Y',
                    Sl: curOriginItem.num || '', // 数量，税局为string
                    Jdctzclsbdhuuid: '', // 机动车uuid
                    AutofocusObject: {}
                });
            // 折扣行
            } else if (discountType === '1') {
                result.push({
                    Xh: i + 1,
                    FphxzDm: '1',
                    Zkxh1: 0,
                    Xmmc: xmmc,
                    Fullxmmc: '',
                    Hwhyslwfwmc: goodsName,
                    Sphfwssflhbbm: curOriginItem.goodsCode || '', // 税收分类编码
                    Spfwjc: spfwjc, // 简称
                    // Ggxh 占位
                    // Dw 占位
                    Spsl: curOriginItem.num ? parseFloat(curOriginItem.num) : '', // number
                    // Dj 占位
                    Je: parseFloat(curOriginItem.detailAmount), // number,
                    Hsje, // 含税金额
                    Slv: curOriginItem.taxRate + '', // 税率，税局字符串
                    Se: parseFloat(curOriginItem.taxAmount), // number,
                    Kce: 0, // 扣除额
                    Jzjtbl: '', // 即征即退比例
                    Jzjtcsfl: '', // 即征即退csfl
                    Lslbz: '', // 零税率标识
                    Xsyhzcbz, // 优惠政策标志
                    SsyhzclxDm,
                    Zzstsgl: '',
                    TdyslxDm: '',
                    TdzsfsDm, // 征收方式代码
                    ZspmDm: '',
                    ZzszcyjDm: '',
                    Hzfpdylzfpmxxh: '',
                    Hsdj: '', // 含税单价
                    Bhsdj: '', // 不含税单价
                    Bhsje, // 不含税金额
                    Zkje: '', // 正常行才有折扣额 被折扣行无需处理
                    SlvOptions: [
                        {
                            Label: curOriginItem.taxRate * 100 + '%',
                            Value: curOriginItem.taxRate + ''
                        }
                    ],
                    AutoSlv: '',
                    Bcmsbz: '',
                    JzjtlxDm: curOriginItem.taxFreeType || '', // 即征即退类型代码
                    Slvbcbz: null,
                    Fylb: '',
                    Zfbl: '',
                    Slqdbz: 'Y',
                    // Sl 占位
                    Jdctzclsbdhuuid: '', // 机动车uuid
                    AutofocusObject: {}
                });
            }
        }
        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    // 根据excel导入的数据格式生成开票数据字段
    /* eslint-disable-next-line complexity */
    changeOpeninvoiceData(originData : any = {}, govUid = '') {
        const ctx = this.ctx;
        const {
            invoiceAmount,
            totalTaxAmount,
            totalAmount,
            invoiceType,
            taxFlag
        } = originData;
        if (!invoiceAmount || !totalAmount || (typeof totalTaxAmount === 'undefined')) {
            return {
                data: {},
                ...errcodeInfo.argsErr,
                description: '参数错误, 开具金额，税额，价税合计不能为空！'
            };
        }

        const newItemsRes = this.createItems(originData);
        let newItems = [];
        if (newItemsRes.errcode !== '0000') {
            return newItemsRes;
        }
        newItems = newItemsRes.data;
        // 26数电普票，27数电专票
        let FppzDm;
        let Hsbz;
        if (invoiceType === '26' || invoiceType === '3') {
            FppzDm = '02';
        } else if (invoiceType === '27' || invoiceType === '4') {
            FppzDm = '01';
        } else {
            ctx.service.log.info('invoiceType', invoiceType);
            return {
                ...errcodeInfo.argsErr,
                description: '开票发票类型错误，请检查！',
                data: {}
            };
        }
        // 含税标志
        if (taxFlag === 0) {
            Hsbz = '1';
        } else if (taxFlag === 1) {
            Hsbz = '2';
        } else {
            return {
                ...errcodeInfo.argsErr,
                description: '含税标志参数错误，请检查！',
                data: {}
            };
        }

        // 自然人标识 默认为N naturalPersonFlag为选填
        const Zrrbs = originData.naturalPersonFlag === 'Y' ? 'Y' : 'N';

        // 附加要素
        const FjysList = (originData.extraList || []).map((o: any) => ({
            Sjlx1: o.extraType || 'string', // 数据类型
            Cjmbmc: '', // 场景模板名称
            Cjmbuuid: '', // 场景模板uuid
            Fjysxmuuid: '', // 附加要素项目uuid
            Fjysxmmc: o.extraName, // 附加要素项目名称
            Fjysmc: o.extraName, // 附加要素名称
            Fjysz: o.extraValue // 附加要素值
        }));

        // 兼容代码 小规模纳税人设置默认开具理由 删除时间点-星瀚支持时
        const taxNoForOpenReason = [
            '91320508321276892D', // 20231123-1-1
            '91110105MA01BHC94B', // 20231128-1-5
            '91320100MA225NDN39', // 20231128-2-5
            '91110106MA00E8DX84', // 20231128-3-5
            '91320508321276892D', // 20231128-4-5
            '91440300062714965N', // 20231128-5-5
            '91440300MA5FAWQN5D'
        ];
        if (~taxNoForOpenReason.indexOf(originData.salerTaxNo)) {
            // ctx.service.log.info('小规模纳税人设置默认开具理由先频闭');
            originData.openReason = '05';
        }

        const result: any = {
            'EwmId': '',
            'FppzDm': FppzDm, // 02数电普通发票，01数电专票
            'TdyslxDm': originData.businessType || '', // 特定业务 特定要素类型代码
            'ZpFppzDm': '', // 纸质发票票种代码
            'Sfwzzfp': 'N', // 是否为纸质发票
            'CezslxDm': originData.differenceTaxType || '', // 差额征收类型代码
            'JazslxDm': originData.reductionTaxType || '', // 减按征税代码
            'Xsfdz': originData.salerAddress || '', // 销售方地址
            'Xsfkhh': originData.salerCardName || '', // 销售方开户行
            'Xsflxdh': originData.salerPhone || '', // 销售方联系电话
            'Xsfmc': originData.salerName || '', // 销售方名称
            'Xsfnsrsbh': originData.salerTaxNo || '', // 销售方税号
            'Xsfshxydm': '', // 销售方社会信用代码
            'Xsfyhzh': originData.salerCardNumber || '', // 销售方银行账户
            'Cpuid': '', // cpuid
            'CpydjToolow': '', // 成品油单价
            'Fhr': originData.reviewer || '', // 复核人
            'Fpdm': '', //
            'Zzfphm': '', // 纸质发票号码
            'Fphm': '', // 发票号码
            'FpkjfsDm': '', // 发票开具
            'Gmfdjxh': '', // 购买方
            'Gmfdz': originData.buyerAddress || null, // 购买方地址
            'Gmfjbr': originData.agentUser || '', // 购买方经办人
            'Gmfkhh': originData.buyerCardName || null, // 购买方开户行
            'Gmflxdh': originData.buyerFixedTelephone || null, // 购买方联系电话
            'Gmfmc': originData.buyerName || '', // 购买方名称
            'Gmfnsrsbh': originData.buyerTaxNo || '', // 购买方纳税人识别号
            'Gmfshxydm': '', // 购买方社会信用代码
            'Gmfyhzh': originData.buyerCardNumber || null, // 购买方银行账户
            'Hjje': originData.invoiceAmount,
            'Hjse': originData.totalTaxAmount,
            'Htbh': '', // 合同编号
            'Ip': '', //
            'Jbrlxdh': '', // 经办人联系电话
            'Jbrsfzjhm': originData.agentCardNo || '', // 经办人身份证件号码
            'JbrsfzjzlDm': originData.agentCardType || '', // 经办人身份证件种类代码
            'Jehj': 0, // 税局为0
            'JsfsDm': '', // 计税方式代码，目前税局为空
            'Jshj': parseFloat(originData.totalAmount).toFixed(2), // 总金额
            'Kce': originData.totalDeduction || 0, // 扣除额
            'Kpfnsrsbh': originData.salerTaxNo || '', // 开票方纳税人识别号
            'Kpr': '', // item.Kpr 开票人
            'Kprq': '', // 开票日期
            'Kprsrrzdzxx': '', // 目前为空
            'Macdz': '', // mac地址，目前为空
            'Nsrdqm': '', // 目前为空
            'Nsywfssj': '', // 目前为空，纳税义务发生时间
            'Ptbm': '', // 目前为空, 平台编码
            'Sflzfpbz': 'Y', // 是否蓝字发票标志
            'SgfplxDm': '', // 目前为空，收购发票类型代码
            'Sjkpdzxx': '', // 目前为空，实际开票地址信息
            'Skr': originData.payee || '', // 收款人
            'Skyh': '', // 目前为空，收款银行
            'Skyhmc': '', // 目前为空，收款银行名称
            'Skzh': '', // 目前为空，收款账户
            'Spsl': newItems.length, // 目前为空，商品数量, 税局修改为1
            'SrrzId': '', // 目前为空
            'XsfDjxh': '', // 目前为空
            'Bz': originData.remark || '', // 备注
            'CurTemplate': '', // 目前为空，模板
            'Hsbz': Hsbz, //  含税标志，含税：Y, 不含税：N
            'Kjly': originData.openReason, // 开具理由
            'GmfZrrbs': Zrrbs, // 购买方自然人标识
            'XsfZrrbs': 'N', // 销售方自然人标识
            'SpflxConfirm': '0', // 自然人标识弹窗确认标识 已确认: 0 未确认: 无字段
            'EscxstyfpZzfpdm': '', // 二手车销售统一发票纸质发票代码
            'EscxstyfpZzfphm': '', // 二手车销售统一发票纸质发票号码
            'EscxstyfpFphm': '', // 二手车销售统一发票发票号码
            'Hzxpbz': 'N', // 税局新增
            'MxzbList': newItems, // 明细
            'CepzmxList': [], // 目前为空
            'JzfwTdys': {}, // 目前为空
            'JzfwfpmxList': [], // 目前为空数组
            'BdcTdys': {
                'Zlqqz': ''
            }, // 不动产
            'BdcMxTdysList': [], // 不动产明细
            'HwysfwdzfpmxbList': [], // 货物运输服务
            'LkysfwTdysList': [], // 旅客运输服务
            'DzccsTdys': {
                'Skssq': ''
            }, //
            'TxfList': [], //
            'TljhLhsgj': {}, //
            'JdcxsTdysList': [], // 机动车销售
            'EscxsTdys': {}, // 二手车销售
            'EscxsTdysList': [], // 二手车销售
            'Ylfw': {
                'Zysj': ''
            }, // 医疗服务
            // 'Qtzjhmbz': false, // 目前为false
            'Slqdbz': '', // 未知
            'Sfzsgmfyhzh': originData.showBuyerCard || '', // 是否在备注栏展示购方银行与账号 N不展示 Y展示
            'Sfzsxsfyhzh': originData.showSalerCard || '', // 是否在备注栏展示销方银行与账号 N不展示 Y展示
            'Ncpsgzjlx': originData.cardType || '', // 农产品收购证件类型
            'GtgmfList': [], // 未知
            'Dfgtgmbq': 'N', // 目前为N
            'Bmqpts': '', // 未知
            'Escyqrhyxz': '', // 二手车
            'JdcKjlp': '', // 机动车开具蓝票
            'VinCode': '', // 未知
            'Fppzl': '01', // cepzlx 01数电票 ???
            'CktslxDm': '', // 出口退税类型代码
            'FjysList': FjysList || [], // 附加要素
            'Dz': originData.buyerAddress || null, // 购买方地址
            'Yhyywdmc': originData.buyerCardName || null, // 购买方开户行
            'Lxdh': originData.buyerFixedTelephone || null, // 购买方联系电话
            'Yhzh': originData.buyerCardNumber || null, // 购买方银行账户
            'Zrrbs': Zrrbs, // 自然人标识
            'Ysxwfsd': '', // 目前为空
            'Gmfyx': '', // 购方邮箱
            'JbrgjDm': originData.agentCountry || '', // 经办人国级代码
            'JbrZrrNsrsbh': originData.agentTaxNo || '', // 经办人自然人纳税人识别号
            'SxedDefptxgz': 'Y', // 开具金额较大，请确认是否开具？ 税局默认无字段或者N不开具进行弹窗确认 Y开具
            'CktsTdysList': null, // 出口退税相关
            'Kjlp': govUid, // 税局唯一流水号
            'GfxxConfirm': '0', // 购方信息弹窗确认标识 已确认: 0 未确认: 无字段,
            'Qtzjhm': ''
        };

        // 特定业务赋值
        const resBusiness: any = this.assignBusinessObjValue(result, originData);

        // 差额征税赋值
        const resDifferenceTax: any = this.assignDifferenceTaxValue(resBusiness.data, originData);

        return resDifferenceTax;
    }

    // 特定业务赋值
    assignBusinessObjValue(result: any, originData: any) {
        const option = SpecificInfoOptions.find((o) => o.code === originData.businessType);

        // 无特定业务直接返回
        if (!option) {
            return {
                ...errcodeInfo.success,
                data: result
            };
        }

        const businessData = originData[option.key];

        switch (originData.businessType) {
            case '03':
                // 建筑服务
                result.JzfwTdys = {
                    Tdzzsxmbh: businessData.landTaxNo, // 土地增值税项目编号
                    Jzfwfsd: businessData.simpleAddress + businessData.detailAddress, // 建筑服务发生地
                    FullAddress: businessData.detailAddress, // 详细地址
                    Jzxmmc: businessData.buildingName, // 建筑项目名称
                    Kdsbz: +businessData.crossCitySign === 1 ? 'Y' : 'N' // 跨地（市）标志
                };
                result.MxzbList = result.MxzbList.map((o: any) => ({
                    ...o,
                    Jzfwfsd: businessData.simpleAddress + businessData.detailAddress,
                    Jzxmmc: businessData.buildingName,
                    Sl1: o.Slv
                }));
                // 特定业务过滤折扣行
                result.JzfwfpmxList = result.MxzbList.filter((o: any) => o.FphxzDm !== '1');
                break;
            case '04':
                // 货物运输服务
                result.HwysfwdzfpmxbList = originData.freightList.map((o: any, i: number) => ({
                    Xh: i + 1, // 行号
                    Qyd: o.startPlace, // 起运地
                    Ddd: o.endPlace, // 到达地
                    Ysgjzl: o.transportType, // 运输工具种类
                    Ysgjhp: o.licensePlate, // 运输工具牌号
                    Yshwmc1: o.transportGoods // 运输货物名称
                }));
                break;
            case '05':
                const specId = generateSpecificId();
                result.BdcTdys = {};
                // 不动产销售服务
                result.BdcTdysfpList = [{
                    Xh: '1',
                    SpecificId: specId,
                    Wqhtbabh: businessData.estateCode, // 不动产单元编码/网签合同备案编号
                    Bdcdz: businessData.simpleAddress + businessData.detailAddress, // 不动产完整地址
                    FullAddress: businessData.detailAddress, // 详细地址
                    Kdsbz: +businessData.crossCitySign === 1 ? 'Y' : 'N', // 跨地（市）标志
                    Tdzzsxmbh: businessData.landTaxNo, // 土地增值税项目编号
                    Hdjsjg: businessData.approvedPrice, // 核定计税价格
                    Sjcjhsje: businessData.actualTurnover, // 实际成交含税金额
                    Cqzsh: businessData.estateId, // 房屋产权证书/不动产权证号
                    Dw: businessData.areaUnit, // 面积单位
                    Zlqqz: '' // 未知
                }];
                result.BdcMxTdysList = [];
                // 特定业务过滤折扣行
                result.MxzbList = result.MxzbList.map((item: any) => {
                    if (item.FphxzDm !== '1') {
                        return {
                            ...item,
                            SpecificId: specId,
                            Cqzsh: businessData.estateId,
                            Dw: businessData.areaUnit
                        };
                    }
                    // 折扣行
                    return {
                        ...item,
                        SpecificId: specId,
                        Dw: ''
                    };
                });
                break;
            case '06':
                // 不动产经营租赁服务只有一行明细，或者一个正常行和一个折扣行
                const specificId = generateSpecificId();
                result.BdcTdys = {};
                let startLeaseDate = businessData.startLeaseDate || '';
                let endLeaseDate = businessData.endLeaseDate || '';
                if (startLeaseDate.length === 8) {
                    startLeaseDate = moment(startLeaseDate, 'YYYYMMDD').format('YYYY-MM-DD');
                }
                if (endLeaseDate.length === 8) {
                    endLeaseDate = moment(endLeaseDate, 'YYYYMMDD').format('YYYY-MM-DD');
                }
                result.BdcTdysfpList = [{
                    Xh: '1',
                    SpecificId: specificId,
                    Bdcdz: businessData.simpleAddress + businessData.detailAddress, // 不动产完整地址
                    FullAddress: businessData.detailAddress, // 详细地址
                    Zlqqz: `${startLeaseDate} ${endLeaseDate}`, // 租赁期起止
                    Kdsbz: +businessData.crossCitySign === 1 ? 'Y' : 'N', // 跨地（市）标志
                    Cqzsh: businessData.estateId, // 房屋产权证书/不动产权证号
                    Dw: businessData.areaUnit // 面积单位
                }];
                result.BdcMxTdysList = [];
                result.MxzbList = result.MxzbList.map((item: any) => {
                    if (item.FphxzDm !== '1') {
                        return {
                            ...item,
                            SpecificId: specificId,
                            Cqzsh: businessData.estateId,
                            Dw: businessData.areaUnit
                        };
                    }
                    // 折扣行
                    return {
                        ...item,
                        SpecificId: specificId,
                        Dw: ''
                    };
                });
                /*
                result.BdcTdys = {
                    Bdcdz: businessData.simpleAddress + businessData.detailAddress, // 不动产完整地址
                    FullAddress: businessData.detailAddress, // 详细地址
                    Zlqqz: `${businessData.startLeaseDate} ${businessData.endLeaseDate}`, // 租赁期起止
                    Kdsbz: +businessData.crossCitySign === 1 ? 'Y' : 'N', // 跨地（市）标志
                    Cqzsh: businessData.estateId, // 房屋产权证书/不动产权证号
                    Dw: businessData.areaUnit // 面积单位
                };
                // 特定业务过滤折扣行
                result.BdcMxTdysList = result.MxzbList.filter((o: any) => o.FphxzDm !== '1').map((o: any) => ({
                    ...o,
                    Cqzsh: businessData.estateId,
                    Dw: businessData.areaUnit
                }));
                */
                break;
            case '09':
                // 旅客运输服务
                result.LkysfwTdysList = originData.travelerList.map((o: any, i: number) => ({
                    Xh: i + 1, // 行号
                    Cxr: o.traveler, // 出行人
                    Chuxrq: o.travelDate, // 出行日期
                    Cxrzjlx: o.cardType, // 出行人证件类型
                    Sfzjhm: o.cardNo, // 出行人证件号码
                    Cfd: o.startPlace, // 出发地
                    Ddd: o.endPlace, // 到达地
                    Dengj: o.seatClass, // 等级
                    Jtgjlx: o.transportType // 交通工具类型
                }));
                break;
            case '13':
                // 拖拉机和联合收割机发票
                result.TljhLhsgj = {
                    Fdjhm: businessData.engineNo || '', // 发动机号码
                    Dphgzbh: businessData.chassisNo || '', // 底盘号/机架号
                    Sfyytljdj: businessData.forRegister // 是否用于办理拖拉机和联合收割机登记
                };
                break;
            case '16':
                // 农产品收购
                result = {
                    ...result,
                    Xsfmc: originData.buyerName || '', // 购买方名称
                    Xsfnsrsbh: originData.buyerTaxNo || '', // 购买方纳税人识别号
                    Xsfdz: originData.buyerAddress || '', // 购买方地址
                    Xsflxdh: originData.buyerFixedTelephone || '', // 购买方联系电话
                    Xsfkhh: originData.buyerCardName || '', // 购买方银行账户
                    Xsfyhzh: originData.buyerCardNumber || '', // 购买方开户行
                    Gmfmc: originData.salerName || '', // 销售方名称
                    Gmfnsrsbh: originData.salerTaxNo || '', // 销售方税号
                    Gmfdz: originData.salerAddress || '', // 销售方地址
                    Gmflxdh: originData.salerPhone || '', // 销售方联系电话
                    Gmfkhh: originData.salerCardName || '', // 销售方银行账户
                    Gmfyhzh: originData.salerCardNumber || '', // 销售方开户行
                    GmfZrrbs: result.XsfZrrbs, // 购买方自然人标识
                    XsfZrrbs: result.GmfZrrbs // 销售方自然人标识
                };
                break;
            default: break;
        }
        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    // 差额征税赋值
    assignDifferenceTaxValue(result: any, originData: any) {
        const { differenceTaxType } = originData;

        // 无差额征税直接返回
        if (!differenceTaxType) {
            return {
                ...errcodeInfo.success,
                data: result
            };
        }

        // 全额开票 无需处理
        if (differenceTaxType === '02') {
            // 差额开票 差额扣除额清单
            result.CepzmxList = originData.deductionList.map((item: any, index: number) => ({
                Xh: index + 1, // 序号
                Pzlx: item.evidenceType || '', // 凭证类型
                Fpdm: item.invoiceCode || '', // 发票代码
                Fphm: item.etaxInvoiceNo || '', // 数电票号码
                Zzfphm: item.invoiceNo || '', // 发票号码
                Pzhm: item.evidenceNo || '', // 凭证号码
                Kjrq: item.invoiceDate || '', // 开具日期
                Hjje: item.evidenceAmount || '', // 凭证合计金额
                Kce: item.deduction || '', // 本次扣除金额
                Bz: item.remark || '', // 备注
                Ly: '手工录入', // 固定
                Bckcje: item.deduction || '', // 本次扣除金额
                Pzhjje: item.evidenceAmount || '' // 凭证合计金额
            }));
        }

        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    async queryOpenUid(loginData: any, invoiceOpenData: any) {
        const ctx = this.ctx;
        const { decryedData = {} } = ctx.request.body;
        const serialNo: string = invoiceOpenData.serialNo;
        let govSerialNo;
        // debug开票模式不在调用税局
        if (decryedData.debugOpenInvoice === true) {
            govSerialNo = getUUId();
        } else {
            const urlPath = '/kpfw/fjxx/v1/kjlp/get';
            const uidRes : any = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
                method: 'GET',
                dataType: 'json'
            });
            ctx.service.log.info('查询开具前的唯一id返回', uidRes);
            if (uidRes.errcode !== '0000') {
                return uidRes;
            }
            if (uidRes.data?.CodeMsg === 'refresh') {
                return errcodeInfo.govLogout;
            }
            govSerialNo = uidRes.data;
        }
        const saveRes = await ctx.service.openHistory.add({
            status: 2,
            serialNo,
            govSerialNo
        });
        if (saveRes.errcode !== '0000') {
            return saveRes;
        }
        return {
            ...errcodeInfo.success,
            data: {
                govSerialNo
            }
        };
    }

    // 检查是否可能已经开具了发票
    async checkIsOpenInvoice(loginData: any = {}, invoiceOpenData: any, openHistory: {
        createTime: number,
        updateTime: number
    }) {
        const ctx = this.ctx;
        let description = '税局返回异常，请2分钟后再重试!';

        let { createTime, updateTime } = openHistory || {};
        if (!createTime) {
            // 处理第一次开票时，获取开票历史无记录的情况
            // 必须查询，保证获取到创建时间
            const oldRes = await ctx.service.openHistory.query(invoiceOpenData.serialNo);
            ctx.service.log.info('checkIsOpenInvoice openHistory query', oldRes);
            // 忽略查询失败 默认当前时间
            const oldResData = oldRes?.data || {};
            createTime = oldResData.createTime || moment().valueOf();
            updateTime = oldResData.updateTime || moment().valueOf();
        }

        ctx.service.log.info('checkIsOpenInvoice openHistory createTime', moment(createTime).format('YYYY-MM-DD HH:mm:ss'));
        ctx.service.log.info('checkIsOpenInvoice openHistory updateTime', moment(updateTime).format('YYYY-MM-DD HH:mm:ss'));

        const curDate = moment(createTime);
        const endDate = moment(updateTime);
        let list: any = [];
        const opt = {
            invoiceType: invoiceOpenData.invoiceType,
            startDate: curDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            buyerName: invoiceOpenData.buyerTaxNo ? '' : invoiceOpenData.buyerName, // 防止全半角查询不到，这里传空, 个人票除外
            buyerTaxNo: invoiceOpenData.buyerTaxNo,
            totalAmount: invoiceOpenData.totalAmount,
            invoiceAmount: invoiceOpenData.invoiceAmount,
            totalTaxAmount: invoiceOpenData.totalTaxAmount,
            page: 0
        };
        let goOn = true;
        let errcode = '0000';
        do {
            opt.page += 1;
            const res = await ctx.service.openInvoiceQuery.queryOpenInvoices(loginData, opt);
            errcode = res.errcode;
            if (res.errcode !== '0000') {
                goOn = false;
                description = res.description;
            } else {
                const resData = res.data || [];
                ctx.service.log.info('checkIsOpenInvoice queryOpenInvoices res', opt.page, res);
                list = list.concat(resData);
                if (res.isEnd) {
                    goOn = false;
                }
            }
        } while (goOn);

        ctx.service.log.info('checkIsOpenInvoice queryOpenInvoices result', list.length, errcode);

        // 查询失败异常
        if (errcode !== '0000') {
            return {
                errcode,
                description
            };
        }

        if (list.length === 0) {
            return errcodeInfo.success;
        }

        const filterRes = await this.filterOpenedInvoices(list);
        ctx.service.log.info('filterOpenedInvoices res', filterRes);
        // 过滤失败
        if (filterRes.errcode !== '0000') {
            return filterRes;
        }
        const fileterList = filterRes.data || [];
        // 过滤之后没有重复开具的发票，直接返回成功
        if (fileterList.length === 0) {
            return errcodeInfo.success;
        }

        // 过滤之后还多余一张，让用户到税局确认
        if (fileterList.length > 1) {
            return errcodeInfo.govOpenedInvoice;
        }

        // 剩余一张发票进行明细比对
        const queryInvoiceData = fileterList[0];
        // 查询开票数据
        const resQuery = await ctx.service.openInvoiceQuery.queryOpenInvoiceDetail(loginData, {
            invoiceType: queryInvoiceData.invoiceType,
            etaxInvoiceNo: queryInvoiceData.etaxInvoiceNo,
            invoiceCode: queryInvoiceData.invoiceCode,
            invoiceNo: queryInvoiceData.invoiceNo,
            invoiceDate: queryInvoiceData.invoiceDate
        });

        if (resQuery.errcode !== '0000') {
            return resQuery;
        }
        const resQueryData = resQuery.data || {};
        // 对比发票明细
        const isMatched = this.compareInvoiceDetails(invoiceOpenData, resQueryData);
        ctx.service.log.info('checkIsOpenInvoice isMatched', isMatched);
        if (isMatched) {
            return {
                ...errcodeInfo.success,
                data: resQueryData
            };
        }

        return errcodeInfo.success;
    }


    // 通过查询后台匹配已经开具成功的发票，然后过滤能够查询出来的发票
    async filterOpenedInvoices(listInvoices: any[]) {
        const ctx = this.ctx;
        const invoiceNos : string[] = [];
        const result = [];
        for (let i = 0; i < listInvoices.length; i++) {
            const item = listInvoices[i];
            const invoiceNo = item.invoiceNo || '';
            if (item.invoiceNo) {
                invoiceNos.push(invoiceNo);
            }
        }

        const res = await ctx.service.openHistory.queryOpenedListByInvoiceNos(invoiceNos);
        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || [];
        const openedInvoiceNos = [];

        // 计算已经开具的发票唯一数组
        for (let i = 0; i < resData.length; i++) {
            const item = resData[i];
            const invoiceNo = item.invoiceNo || '';
            const invoiceCode = item.invoiceCode || '';
            let etaxInvoiceNo = item.etaxInvoiceNo || '';
            // 防止etaxInvoiceNo相同时干扰
            if (etaxInvoiceNo === invoiceNo && invoiceNo !== '') {
                etaxInvoiceNo = '';
            }
            openedInvoiceNos.push([invoiceNo, etaxInvoiceNo, invoiceCode].join('-'));
        }

        ctx.service.log.info('filterOpenedInvoices openedInvoiceNos', openedInvoiceNos);
        // 通过发票唯一数组进行过滤
        for (let i = 0; i < listInvoices.length; i++) {
            const item = listInvoices[i];
            const invoiceNo = item.invoiceNo || '';
            const invoiceCode = item.invoiceCode || '';
            let etaxInvoiceNo = item.etaxInvoiceNo || '';
            // 防止etaxInvoiceNo相同时干扰
            if (etaxInvoiceNo === invoiceNo && invoiceNo !== '') {
                etaxInvoiceNo = '';
            }
            const invoiceKey = [invoiceNo, etaxInvoiceNo, invoiceCode].join('-');
            if (openedInvoiceNos.indexOf(invoiceKey) === -1) {
                result.push(item);
            }
        }
        return {
            ...errcodeInfo.success,
            data: result
        };
    }

    // 比较发票明细
    compareInvoiceDetails(openData: any, queryData: any): boolean {
        const ctx = this.ctx;
        const openRemark = openData.remark || '';
        const queryRemark = queryData.remark || '';
        const openItems = openData.items || [];
        const queryItems = queryData.items || [];
        if (clearChars(openRemark) !== clearChars(queryRemark) || openItems.length !== queryItems.length) {
            ctx.service.log.info('备注或者明细长度匹配不上');
            return false;
        }

        let isMatched = true;
        // 比较最多二十条明细
        const length = queryItems.length;
        for (let i = 0; i < length; i++) {
            const openItem = openItems[i] || {};
            const queryItem = queryItems[i] || {};
            // 因为数量、单价的精度问题不比较, goodsCode折扣行才有
            if (clearChars(openItem.goodsName) !== clearChars(queryItem.goodsName) ||
                Number(openItem.detailAmount) !== Number(queryItem.detailAmount) ||
                Number(openItem.taxAmount) !== Number(queryItem.taxAmount)
            ) {
                isMatched = false;
                break;
            }
            // 前面10条，后面10条
            if (i === 9) {
                i = Math.max(i, length - 10);
            }
        }
        return isMatched;
    }

    // 根据描述匹配是否需要进入校验已经开具的发票流程
    isNeedCheckOpenedInvoice(res: any = {}, invoiceData: any = {}) {
        const description = res.description || '';
        // 税局确认已经开成功，如果在税局查询异常或者查询不到都不能通过原始流水号自动重新开具发票
        if (description.indexOf('系统检测到您在当前页已成功开具发票') !== -1) {
            return 1;
        }

        // 税局可能已经开成功，需要控制1小时查询
        if ((description.indexOf('内部错误') !== -1) || (description.indexOf('税局执行超时') !== -1) ||
        (description.indexOf('请求异常') !== -1) || (description.indexOf('服务器数据返回错误') !== -1)) {
            // 金额大于1w的控制1小时锁定
            if (invoiceData && invoiceData.totalAmount > 10000) {
                return 7;
            }
            return 2;
        }

        if (description.indexOf('税局数据请求超时') !== -1) {
            // 金额大于1w的控制1小时锁定
            if (invoiceData && invoiceData.totalAmount > 10000) {
                return 7;
            }
            return 2;
        }

        // 税局可能已经开成功，原始流水号如果在税局查询异常不能自动重新开具发票，如果税局查询匹配为空可以用原始流水号开具发票
        if ((description.indexOf('无效请求') !== -1 && description.indexOf('请重新进入开具页面') !== -1) ||
        (description.indexOf('开票请求已失效') !== -1)) {
            return 2;
        }
        return '';
    }

    async startOpenInvoice(loginData: any, invoiceOpenData: any, cachedGovSerialNo: string, openHistory: {
        createTime: number,
        updateTime: number
    }) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { decryedData = {}, etaxAccountInfo } = ctx.request.body;
        const { city } = etaxAccountInfo || {};
        const { serialNo, salerTaxNo } = invoiceOpenData;
        ctx.service.log.fullInfo('对开票数据格式进行转换');
        const bodyDataRes = this.changeOpeninvoiceData(invoiceOpenData);
        if (bodyDataRes.errcode !== '0000') {
            return bodyDataRes;
        }

        let govSerialNo = '';
        if (cachedGovSerialNo) {
            govSerialNo = cachedGovSerialNo;
            const upRes = await ctx.service.openHistory.update({
                status: 2,
                serialNo,
                govSerialNo
            });
            // 防止重复开票
            if (upRes.errcode !== '0000') {
                return upRes;
            }
        } else {
            const uidRes = await this.queryOpenUid(loginData, invoiceOpenData);
            if (uidRes.errcode !== '0000') {
                return uidRes;
            }
            govSerialNo = uidRes.data.govSerialNo || '';
        }

        const bodyData = bodyDataRes.data;
        bodyData.Kjlp = govSerialNo.substring(0, govSerialNo.length - 1);
        // 暂时不用
        // yjms = govSerialNo.substring(tempGovSerialNo.length - 1);

        // 开具发票
        const urlPath = '/kpfw/lzfpkj/v1/tyfpkj';

        ctx.service.log.fullInfo('调用税局的开票地址', urlPath);
        ctx.service.log.fullInfo('调用税局的开票参数', bodyData);

        // 不触发实际开票，直接返回成功
        if (decryedData.debugOpenInvoice === true) {
            ctx.service.log.info('debugOpenInvoice开具成功');
            const openResult : any = {
                invoiceNo: '6666666' + (+new Date()),
                invoiceDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                govSerialNo: govSerialNo,
                serialNo: serialNo
            };
            await ctx.service.openHistory.update({
                status: 1,
                ...openResult
            });
            return {
                ...errcodeInfo.success,
                data: openResult
            };
        }
        let openRes : any = errcodeInfo.govErr;
        // 销售方税号 登录税号 地址栏税号 三者必须一致
        if (salerTaxNo !== loginData.taxNo || salerTaxNo !== queryInfo.taxNo) {
            ctx.service.log.info('startOpenInvoice企业税号不一致，请检查', salerTaxNo, loginData.taxNo, queryInfo.taxNo);
            return {
                ...errcodeInfo.argsErr,
                description: '开票信息的销售方税号与当前账户的企业税号不一致'
            };
        }
        try {
            // 开票状态 1开具成功 2开具中 3开具异常 4开票串号 5校验开票数据异常 6失败允许重试 7税局内部异常 8登录失效导致开票失败
            openRes = await ctx.service.nt.ntEncryCurl(loginData, urlPath, bodyData, {
                disabledRetry: true,
                timeout: 120000
            });
            // 开票状态 1开具成功 2开具中 3开具异常 4开票串号 5校验开票数据异常 6失败允许重试 7税局内部异常
            // openRes = await ctx.service.nt.openInvoiceByChrome(loginData, urlPath, {
            //     disabledRetry: true,
            //     method: 'POST',
            //     dataType: 'text',
            //     contentType: 'json',
            //     body: bodyData,
            //     timeout: [12000, 300000] // 开票超时时间5分钟
            // });
            const option = SpecificInfoOptions.find((o) => o.code === invoiceOpenData.businessType);
            ctx.service.log.info('税局开具返回', option?.name, openRes);
        } catch (error) {
            // 开具异常 失败存疑 规定时间内需查询税局
            await ctx.service.openHistory.update({
                status: 3,
                serialNo
            });
            ctx.service.log.info('税局开具异常 error', error.toString());
            return errcodeInfo.govErr;
        }

        let Fphm;
        let Kprq;

        if (openRes.errcode !== '0000') {
            const description = openRes.description || errcodeInfo.govErr.description;
            ctx.service.log.info('税局开具异常', description);
            // 可能因为到税局实名认证，导致提示：身份认证成功时间查询失败:请重新登录后继续办理业务
            if (description.indexOf('请重新登录') !== -1 || openRes.errcode === '91300' || description.indexOf('扫脸认证已超时') !== -1) {
                await ctx.service.openHistory.update({
                    status: 8, // 登录失效导致开票失败
                    serialNo,
                    govSerialNo: ''
                });
                if (description.indexOf('扫脸认证已超时') !== -1) {
                    return openRes;
                }
                return errcodeInfo.govLogout;
            }
            const needCheckType = this.isNeedCheckOpenedInvoice(openRes, invoiceOpenData);
            if (needCheckType) {
                const res = await this.checkIsOpenInvoice(loginData, invoiceOpenData, openHistory);
                if (res.errcode !== '0000') {
                    // 开具异常 失败存疑 规定时间内需查询税局
                    await ctx.service.openHistory.update({
                        status: needCheckType === 7 ? 7 : 3, // 3开具异常限制3分钟 7内部错误限制60分钟
                        serialNo
                    });
                    // 税局明确返回已经开具成功
                    if (needCheckType === 1) {
                        return errcodeInfo.govOpenedInvoice;
                    }
                    // 内部错误
                    if (needCheckType === 7) {
                        return {
                            ...errcodeInfo.govErr,
                            description: `局端内部错误，该开票请求修复中，请${moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm')}后再试！`
                        };
                    }
                    return res;
                }
                const checkData = res.data || {};
                Fphm = checkData.invoiceNo || '';
                Kprq = checkData.invoiceDate || '';
                if (!Fphm || !Kprq) {
                    // 开具异常 失败存疑 规定时间内需查询税局
                    await ctx.service.openHistory.update({
                        status: needCheckType === 7 ? 7 : 3, // 3开具异常限制3分钟 7内部错误限制60分钟
                        serialNo
                    });
                    // 税局明确返回已经开具成功
                    if (needCheckType === 1) {
                        return errcodeInfo.govOpenedInvoice;
                    }
                    // 内部错误
                    if (needCheckType === 7) {
                        return {
                            ...errcodeInfo.govErr,
                            description: `局端内部错误，该开票请求修复中，请${moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm')}后再试！`
                        };
                    }
                    return {
                        ...errcodeInfo.govErr,
                        description: '开票请求已失效，请重新进行开票操作'
                    };
                }
            } else {
                // 其它 6允许重试
                await ctx.service.openHistory.update({
                    status: 6,
                    serialNo,
                    govSerialNo: ''
                });
                return {
                    ...openRes,
                    description
                };
            }
        } else {
            // 开具返回成功
            const openData = openRes.data || {};
            Fphm = openData.Fphm;
            Kprq = openData.Kprq;
            if (typeof openData.Data === 'string' && openData.T) {
                await ctx.service.openHistory.update({
                    status: 6,
                    serialNo,
                    govSerialNo: ''
                });
                return {
                    ...errcodeInfo.govErr,
                    description: '开票请求已失效，请重新进行开票操作'
                };
            }
            // 发票开具提示刷新
            if (openData.CodeMsg === 'refresh') {
                return errcodeInfo.govLogout;
            }
        }

        if (Fphm && Kprq) {
            ctx.service.log.info(city, '税局开具成功');
            const openResult : any = {
                status: 1,
                invoiceNo: Fphm,
                invoiceDate: Kprq,
                govSerialNo: govSerialNo,
                serialNo: serialNo
            };
            // 更新开票历史
            await ctx.service.openHistory.update({
                serialNo,
                ...openResult
            });
            const returnRes = {
                ...errcodeInfo.success,
                data: openResult
            };
            ctx.service.log.info(city, '开具成功', returnRes);
            return returnRes;
        }
        // 开具异常 失败存疑 规定时间内需查询税局
        await ctx.service.openHistory.update({
            status: 3,
            serialNo
        });
        ctx.service.log.info('开具异常, 未返回发票号码或开票日期');
        return {
            ...errcodeInfo.govErr,
            description: '税局返回异常, 请稍后再试！'
        };
    }

    createChTips(result : any = {}, onlyInvoiceInfo = false) {
        const descriptionArr = onlyInvoiceInfo ? [] : ['开票可能出现串号'];
        if (result.invoiceNo) {
            descriptionArr.push(`发票号码：${result.invoiceNo}`);
        }
        if (result.invoiceDate) {
            descriptionArr.push(`开票日期：${result.invoiceDate}`);
        }
        if (result.pdfUrl) {
            descriptionArr.push(`pdf地址：${result.pdfUrl}`);
        }
        if (!onlyInvoiceInfo) {
            descriptionArr.push('请确认后联系管理员再开票!');
        }
        return descriptionArr.join(',');
    }

    // 检查开具的发票号码是否正确
    async handleCheckFphm(loginData: any, fileJSONData: any, openResult: any = {}) {
        const ctx = this.ctx;
        const {
            serialNo,
            invoiceNo,
            invoiceDate,
            xmlUrl // 默认为空，不走xml校验
        } = openResult;
        const { decryedData = {} } = ctx.request.body;
        if (decryedData.debugOpenInvoice === true) {
            ctx.service.log.info('debug模式不校验串号');
            await ctx.service.openHistory.update({
                status: 1,
                serialNo
            });
            return errcodeInfo.success;
        }
        const analysisUrl = xmlUrl;
        let res;
        let targetInvoiceInfo : any = {};
        // 默认为空，不走xml校验
        if (analysisUrl) {
            ctx.service.log.info('开始解析文件', analysisUrl);
            res = await ctx.service.openHistory.analysis(analysisUrl);
            if (res.errcode === '0000') {
                targetInvoiceInfo = res.data || {};
            } else {
                ctx.service.log.info('解析文件数据异常', res);
            }
        }

        const isOkForTargetInvoiceInfo = (originData: any, targetData: any) => {
            const isOk = targetData && targetData.invoiceAmount && targetData.totalAmount && typeof targetData.totalTaxAmount !== 'undefined';
            if (originData?.businessType === '16') {
                // 收购票
                return isOk && targetData.buyerTaxNo;
            }
            return isOk && targetData.salerTaxNo;
        };

        if (!isOkForTargetInvoiceInfo(fileJSONData, targetInvoiceInfo)) {
            // 文件校验数据接口调用异常，使用税局查询
            res = await ctx.service.openInvoiceQuery.queryOpenInvoiceDetail(loginData, {
                invoiceType: fileJSONData.invoiceType,
                invoiceNo,
                invoiceDate
            });
            if (res.errcode === '0000') {
                targetInvoiceInfo = res.data || {};
            } else {
                ctx.service.log.info('查询开票数据异常', res);
                if (res.errcode === '91300') {
                    await ctx.service.openHistory.update({
                        status: 5,
                        serialNo
                    });
                    return res;
                }
            }
        }

        // 两次查询都查询失败
        if (!isOkForTargetInvoiceInfo(fileJSONData, targetInvoiceInfo)) {
            ctx.service.log.fullInfo('开票数据获取不完整，校验失败', targetInvoiceInfo);
            // 串号校验获取发票数据失败
            await ctx.service.openHistory.update({
                status: 5,
                serialNo
            });
            return {
                ...errcodeInfo.govErr,
                description: this.createChTips(openResult, true) + ', 校验开票数据异常，请重试!',
                data: {
                    status: 5
                }
            };
        }

        const isOkForFileJSONData = (originData: any, targetData: any) => {
            const isOk = (parseInt(originData.invoiceType) === parseInt(targetData.invoiceType)) &&
            (fixedFloatNumber(originData.invoiceAmount, 2) === fixedFloatNumber(targetData.invoiceAmount, 2)) &&
            (fixedFloatNumber(originData.totalAmount, 2) === fixedFloatNumber(targetData.totalAmount, 2)) &&
            (fixedFloatNumber(originData.totalTaxAmount, 2) === fixedFloatNumber(targetData.totalTaxAmount, 2)) &&
            (clearChars(originData.remark) === clearChars(targetData.remark));

            // 购方名称 区分收购票
            let targetDataBuyerName = originData?.businessType === '16' ? targetData.salerName : targetData.buyerName;
            if (originData.naturalPersonFlag === 'Y') {
                // 购买方自然人标识为Y时，税局会在购方名称后添加‘（个人）’，对比前需去除
                targetDataBuyerName = targetDataBuyerName.replace(/（个人）$/, '');
            }

            if (originData?.businessType === '16') {
                // 收购票
                return (
                    isOk && originData.salerTaxNo === targetData.buyerTaxNo &&
                    clearChars(originData.buyerName) === clearChars(targetDataBuyerName) &&
                    (!originData.buyerTaxNo || (originData.buyerTaxNo === targetData.salerTaxNo))
                );
            }

            return (
                isOk && originData.salerTaxNo === targetData.salerTaxNo &&
                clearChars(originData.buyerName) === clearChars(targetDataBuyerName) &&
                (!originData.buyerTaxNo || (originData.buyerTaxNo === targetData.buyerTaxNo))
            );
        };

        if (isOkForFileJSONData(fileJSONData, targetInvoiceInfo)) {
            ctx.service.log.fullInfo('开票数据核对成功');
            await ctx.service.openHistory.update({
                status: 1,
                serialNo
            });
            return {
                ...errcodeInfo.success,
                data: targetInvoiceInfo
            };
        }
        ctx.service.log.fullInfo('开票数据核对失败', targetInvoiceInfo);
        await ctx.service.openHistory.update({
            status: 4,
            serialNo
        });
        return {
            ...errcodeInfo.govOpenInvoiceChError,
            description: this.createChTips(openResult),
            data: {
                status: 4
            }
        };
    }

    async open(fileJSONData: any) {
        const ctx = this.ctx;
        const serialNo = fileJSONData.serialNo;
        const { pageId } = ctx.request.query || {};
        ctx.service.log.info('plugin service --------------');

        ctx.service.log.info('查询是否已经开具过发票');
        const oldRes = await ctx.service.openHistory.query(serialNo);
        ctx.service.log.info('查询是否已经开具过发票接口返回', oldRes);
        if (oldRes.errcode !== '0000') {
            return oldRes;
        }
        const oldResData = oldRes.data || {};
        const updateTime = oldResData.updateTime;
        const createTime = oldResData.createTime;
        const govInvoiceQrUrl = oldResData.govInvoiceQrUrl || '';
        let openStatus = oldResData.status;
        // 处于开具中的状态，最后更新时间大于10分钟可能更新接口异常了，开具状态修改开具失败，允许重新通过税局的流水号重新开具
        if (updateTime && openStatus === 2 && (+new Date() - updateTime > 10 * 60 * 1000)) {
            openStatus = 3;
        }
        if (openStatus === 4) {
            return {
                ...errcodeInfo.govOpenInvoiceChError,
                description: this.createChTips(oldResData)
            };
        }

        // 获取RPA预生成发票链接
        const resRPAPreGeneration = ctx.service.openInvoice.getRPAPreGenerationUrl(serialNo);
        if (resRPAPreGeneration.errcode !== '0000') {
            return resRPAPreGeneration;
        }
        const RPAPreGenerationUrl = resRPAPreGeneration.data;

        // 已经开具成功过的发票，直接返回
        if (oldResData && oldResData.invoiceNo && oldResData.invoiceNo.length > 7) {
            const cacheFiles = {
                ofdUrl: oldResData.ofdUrl || '',
                pdfUrl: oldResData.pdfUrl || '',
                xmlUrl: oldResData.xmlUrl || ''
            };
            // 重新下载异步处理
            ctx.service.openInvoice.downloadInvoiceFiles({
                serialNo,
                govSerialNo: fileJSONData.govSerialNo,
                invoiceDate: oldResData.invoiceDate,
                invoiceNo: oldResData.invoiceNo,
                invoiceType: fileJSONData.invoiceType,
                type: fileJSONData.type,
                govInvoiceQrUrl
            }, cacheFiles);

            ctx.service.log.info('openStatus', openStatus);
            // 默认置空开票人
            let drawer = '';
            // 上次校验串号出现异常，需要重新校验
            if (openStatus === 5) {
                const queryInfo = ctx.request.query || {};
                const curLoginData = await pwyStore.get(etaxLoginedCachePreKey + queryInfo.pageId);
                // 校验串号
                const chRes: any = await this.handleCheckFphm(curLoginData, fileJSONData, {
                    serialNo,
                    invoiceDate: oldResData.invoiceDate,
                    invoiceNo: oldResData.invoiceNo
                });
                // 检查串号异常
                if (chRes.errcode !== '0000') {
                    return chRes;
                }
                drawer = chRes.data?.drawer || '';
            }
            const cacheResult = {
                invoiceCode: oldResData.invoiceCode || '',
                invoiceNo: oldResData.invoiceNo || '',
                invoiceDate: oldResData.invoiceDate || '',
                govSerialNo: oldResData.govSerialNo || '',
                serialNo,
                drawer,
                ...RPAPreGenerationUrl,
                availableVolume: '',
                totalVolume: ''
            };
            // 异步 aws传入的数电开票需要保存完整的开票数据
            ctx.service.openHistory.uploadFullInfo(fileJSONData, cacheResult);
            return {
                ...errcodeInfo.success,
                data: cacheResult
            };
        }

        // 非正式环境，开票金额限制最大100
        if (ctx.app.config.env !== 'prod' && fileJSONData.totalAmount > 100) {
            return {
                ...errcodeInfo.argsErr,
                description: '价税合计金额超出开具限制，请检查！'
            };
        }

        // 如果传入税局的流水号，则直接使用传入的流水号进行开具，主要用于测试验证税局重复开票的拦截，正式环境可以不用传govSerialNo
        let cachedGovSerialNo = fileJSONData.govSerialNo || oldResData.govSerialNo || '';
        if (openStatus === 2) {
            return {
                ...errcodeInfo.argsErr,
                description: '该发票正在开具中，请勿重复开具！'
            };
        }
        ctx.service.log.info('开票校验 start');
        const excelRes = await ctx.service.etaxOpen.etaxOpenVerification({ ...fileJSONData });
        ctx.service.log.info('开票校验 end', excelRes);
        if (excelRes.errcode !== '0000') {
            if (openStatus === 3) {
                // 兼容 新通道将开具状态错误置为3且参数错误无法开票时更新发票状态6
                await ctx.service.openHistory.update({
                    status: 6,
                    serialNo,
                    govSerialNo: ''
                });
            }
            return excelRes;
        }
        const invoiceAmount = fileJSONData.invoiceAmount;

        const checkRes = await ctx.service.ntTools.checkEtaxLogined();
        if (checkRes.errcode !== '0000') {
            return checkRes;
        }
        const loginData = checkRes.data || {};
        const openLimitRes = await ctx.service.openInvoiceQuery.queryBlueInvoiceOpenInfo(loginData);
        if (openLimitRes.errcode !== '0000') {
            return openLimitRes;
        }
        const { availableVolume } = openLimitRes.data || {};
        if (invoiceAmount > availableVolume) {
            // 授信额度不足时需要删除本地额度，下次开票再和同步税局同步
            ctx.service.openInvoiceQuery.deleteOpenInfo(loginData.pageId);
            return {
                ...errcodeInfo.argsErr,
                description: '可用授信额度不足，请到税局调整后再开票！'
            };
        }


        ctx.service.log.info('open getNt start');
        const ntRes = await ctx.service.nt.getNt(loginData);
        ctx.service.log.info('open getNt end');
        if (ntRes.errcode !== '0000') {
            return ntRes;
        }
        const nt = ntRes.data;
        ctx.service.nt.simulateClick(nt, pageId);
        // 开具返回
        let invoiceNo;
        let invoiceDate;
        let govSerialNo;

        // 2开具中 3开具异常 7税局内部异常 失败存疑 限制时间内需查询税局
        if (openStatus === 2 || openStatus === 3 || openStatus === 7) {
            ctx.service.log.info('open checkIsOpenInvoice start', createTime, updateTime);
            const checkIsOpenRes = await this.checkIsOpenInvoice(loginData, fileJSONData, {
                createTime,
                updateTime
            });
            ctx.service.log.info('open checkIsOpenInvoice end', checkIsOpenRes);
            if (checkIsOpenRes.errcode !== '0000') {
                return checkIsOpenRes;
            }
            const checkData = checkIsOpenRes.data || {};
            invoiceNo = checkData.invoiceNo || '';
            invoiceDate = checkData.invoiceDate || '';
            govSerialNo = cachedGovSerialNo;

            if (invoiceNo && invoiceDate) {
                ctx.service.log.info('checkIsOpenInvoice 税局开具成功');
                // 更新开票历史
                await ctx.service.openHistory.update({
                    serialNo,
                    invoiceNo,
                    invoiceDate,
                    govSerialNo
                });
            } else {
                // 2开具中 3开具异常 开具状态更新后的3分钟之内在税局未查询发票时返回开具中
                if (openStatus === 2 || openStatus === 3) {
                    const time = 3 * 60 * 1000 + +updateTime;
                    if (time > +new Date()) {
                        return {
                            ...errcodeInfo.govErr,
                            description: `该发票查询为空，请${moment(time).format('YYYY-MM-DD HH:mm')}后再试！`
                        };
                    }
                }
                // 7税局内部异常 开具状态更新后的60分钟之内在税局未查询发票时返回开具中
                if (openStatus === 7) {
                    const time = 30 * 60 * 1000 + +updateTime;
                    if (time > +new Date()) {
                        return {
                            ...errcodeInfo.govErr,
                            description: `局端内部错误，该开票请求修复中，请${moment(time).format('YYYY-MM-DD HH:mm')}后再试！`
                        };
                    }
                }

                // 限制时间已过，允许重试开票
                await ctx.service.openHistory.update({
                    status: 6,
                    serialNo,
                    govSerialNo: ''
                });
                cachedGovSerialNo = '';
            }
        }

        if (!(invoiceNo && invoiceDate)) {
            // 每次都使用新的流水号去开
            const openRes = await this.startOpenInvoice(loginData, fileJSONData, cachedGovSerialNo, createTime);
            ctx.service.log.info('通过单张接口开具发票返回', openRes);
            if (openRes.errcode !== '0000') {
                return {
                    errcode: openRes.errcode,
                    description: openRes.description
                };
            }
            const openResData = openRes.data || {};
            invoiceNo = openResData.invoiceNo;
            invoiceDate = openResData.invoiceDate;
            govSerialNo = openResData.govSerialNo;
        }

        let availableVolumeRes = {
            availableVolume: '',
            totalVolume: ''
        };
        // 有本地缓存开具状态已经更新过授信额度，不需要再更新
        availableVolumeRes = await ctx.service.openInvoiceQuery.updateAvailableVolume(loginData.pageId, invoiceAmount);
        ctx.service.log.info('授信额度更新返回', loginData.pageId, invoiceAmount, availableVolumeRes);

        let drawer = loginData.drawer || '';
        if (!drawer) {
            // 校验串号
            const chRes: any = await this.handleCheckFphm(loginData, fileJSONData, {
                serialNo,
                invoiceNo,
                invoiceDate
            });
            // 检查串号异常
            if (chRes.errcode !== '0000') {
                return chRes;
            }
            const chResData = chRes.data || {};
            drawer = chResData.drawer;
            const newLoginData = {
                ...loginData,
                drawer
            };
            await pwyStore.set(etaxLoginedCachePreKey + pageId, newLoginData, 12 * 60 * 60);
            await ctx.service.ntTools.updateRemoteLoginStatus(pageId, newLoginData);
        }

        const openResult = {
            invoiceCode: '',
            invoiceNo,
            invoiceDate,
            govSerialNo,
            serialNo,
            drawer,
            ...RPAPreGenerationUrl,
            ...availableVolumeRes // availableVolume, totalVolume
        };

        // 异步 aws传入的数电开票需要保存完整的开票数据
        ctx.service.openHistory.uploadFullInfo(fileJSONData, openResult);
        ctx.service.log.info('开始下载开票文件');
        // 开具成功异步处理
        ctx.service.openInvoice.downloadInvoiceFiles({
            serialNo,
            govSerialNo,
            invoiceDate,
            invoiceNo,
            invoiceType: fileJSONData.invoiceType,
            type: fileJSONData.type,
            govInvoiceQrUrl
        });

        return {
            ...errcodeInfo.success,
            data: openResult
        };
    }
}