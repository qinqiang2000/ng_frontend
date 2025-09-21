
const basicInfoIcon = require('./img/basicInfoIcon.svg'); // 基础数据
const taxRuleIcon = require('./img/taxRuleIcon.svg'); // 计税规则维护
const ledgerManageIcon = require('./img/ledgerManageIcon.svg'); // 台账管理
const reportDraftIcon = require('./img/reportDraftIcon.png'); // 小规模增值税
const taxReportIcon = require('./img/taxReportIcon.png'); //一般纳税人增值税
const staticsIcon = require('./img/staticsIcon.svg'); //统计查询看板
const statementIcon = require('./img/statement_white.svg'); //对账开票
const jxfpglIcon = require('./img/jxfpgl.svg'); // 进项税额管理, , 进项发票管理
const paraSetIcon = require('./img/paraSet.png'); // 系统设置
const imageManageIcon = require('./img/invoiceImg.svg'); // 发票影像管理
const xxfpglIcon = require('./img/xxfpgl.svg'); // 销项发票管理
const userIcon = require('./img/userIcon.svg'); // 用户管理
const orgIcon = require('./img/orgIcon.svg'); // 组织管理
const orderManageIcon = require('./img/orderManageIcon.png'); // 订货管理
const dataDownloadIcon = require('./img/dataDownloadIcon.png'); // 数据下载
const hotelInvoiceIcon = require('./img/hotelInvoiceIcon.png'); // 酒店开票
/*
const iconKeys = {
    'basicInfo': basicInfoIcon,
    'orgManage': orgIcon,
    'userManage': userIcon,
    'taxRuleConfig': taxRuleIcon,
    'ledgerManage': ledgerManageIcon,
    'sbdggl': reportDraftIcon,
    'nssb': taxReportIcon,
    'tjcxkb': staticsIcon,
    'accountBill':statementIcon,
    'imageManage': imageManageIcon,
    'jxfpgl': jxfpglIcon,
    'xxfpgl': jxfpglIcon,
    'systemSetting': paraSetIcon
}
*/

export default {
    basicInfo: {
        name: '基础数据',
        icon: basicInfoIcon,
        status: 2, //1可用2外部不可用内部可用，3外部内部都不可用（旧项目迁移还未开发）
        children: {
            sssjdr: {
                name: '涉税数据导入',
                path: '/basicData/taxDataImport/index',
                status: 3
            },
            sksb: {
                status: 3,
                name: '税控设备',
                path: '/merchants-cms-web/basic/taxDevice'
            },
            fpxxcsh: {
                status: 3,
                name: '发票信息初始化',
                path: '/business-cms-web/basic/InvoiceInit'
            },
            ssflbmpz: {
                status: 3,
                name: '税收分类编码配置',
                path: '/business-cms-web/basic/TaxConf'
            }
        }
    },
    orgManage: {
        icon: orgIcon,
        status: 1,
        name: '组织管理',
        children: {
            baseOrgInfo: {
                name: '组织机构',
                path: '/orgManage/baseOrgList',
                status: 1
            },
            taxInfo: {
                name: '税务信息',
                path: '/orgManage/taxInfo',
                status: 2
            },
            userList: {
                name: '用户列表',
                path: '/userManage/userList',
                status: 1
            },
            roleList: {
                name: '角色列表',
                path: '/userManage/roleList',
                status: 1
            }
        }
    },
    kpgzt: {
        name: '开票工作台',
        status: 3
    },
    fpgl: {
        name: '发票管理',
        status: 3
    },
    imageManage: {
        name: '发票影像管理',
        status: 3,
        icon: imageManageIcon,
        children: {
            imageCapture: {
                name: '影像采集',
                path: '/imageManage/imageCapture',
                status: 1
            },
            imageWorkspace: {
                name: '增值税发票工作台',
                path: '/imageManage/imageWorkspace',
                status: 1
            },
            noneAddedTax: {
                name: '非增值税发票工作台',
                path: '/imageManage/noneAddedTax',
                status: 1
            },
            multiInvoiceCheck: {
                name: '多张发票识别',
                path: '/imageManage/multiInvoiceCheck',
                status: 1
            }
        }
    },
    accountBill: {
        name: '对账开票',
        icon: statementIcon,
        status: 1,
        children: {
            billingSet: {
                name: '开票限额设置',
                path: '/accountBill/billingSet',
                status: 1
            },
            receiveBill: {
                name: '收到的对账单',
                path: '/accountBill/receiveBill',
                status: 1
            },
            sendBill: {
                name: '发出的对账单',
                path: '/accountBill/sendBill',
                status: 1
            }
        }
    },
    jxfpgl: {
        name: '进项税额管理',
        icon: jxfpglIcon,
        status: 3,
        children: {
            jxfprz: {
                name: '进项发票认证',
                path: '/ledgerManage/incomeLedger',
                status: 1
            },
            jxzcdj: {
                name: '进项转出登记',
                path: '/incomeTaxMgmt/incomeRollOutReg',
                status: 1
            },
            hgjks: {
                name: '海关缴款书',
                path: '/incomeTaxMgmt/customsTax',
                status: 1
            }
        }
    },
    taxRuleConfig: {
        name: '计税规则维护',
        icon: taxRuleIcon,
        status: 3,
        children: {
            tplDesign: {
                path: '/taxRuleConfig/tplDesign',
                status: 1
            }
        }
    },
    ledgerManage: {
        name: '台账管理',
        icon: ledgerManageIcon,
        status: 2,
        children: {
            tzkb: {
                name: '台账看板',
                path: '/ledgerManage/ledgerBoard',
                status: 1
            }
        }
    },
    sbdggl: {
        name: '小规模增值税', //申报底稿管理
        icon: reportDraftIcon,
        status: 3,
        children: {
            smallDraft: {
                name: '申报底稿管理', //增值税申报底稿管理
                path: '/reportDraft/smallScale/index',
                status: 1
            },
            g3SmallDeclarationForm: {
                name: '申报表编制',
                path: '/taxReport/smallDeclarationFormMaking',
                status: 1
            }
        }
    },
    xxfpgl: {
        name: '销项发票管理',
        icon: xxfpglIcon,
        status: 1,
        children: {
            dzkp: {
                name: '单张开票',
                path: '/salerInvoiceMng/singleOpenInvoice',
                status: 1
            },
            fpzf: {
                name: '发票作废',
                path: '/salerInvoiceMng/invoiceCancel',
                status: 1
            },
            plkp: {
                name: '批量开票',
                path: '/salerInvoiceMng/multiOpenInvoice',
                status: 1
            },
            smkp: {
                name: '扫码开票',
                path: '/salerInvoiceMng/scanOpenInvoice',
                status: 1
            },
            kpcx: {
                name: '开票查询',
                path: '/salerInvoiceMng/invoiceSearch',
                status: 1
            },
            kptj: {
                name: '开票统计',
                path: '/salerInvoiceMng/invoiceStatistics',
                status: 1
            },
            fpdy: {
                name: '发票打印',
                path: '/salerInvoiceMng/invoicePrint',
                status: 1
            },
            invoiceUser: {
                name: '开票设置',
                path: '/salerInvoiceMng/invoiceUser',
                status: 1
            },
            dkfp: {
                name: '开票错误日志查询',
                path: '/salerInvoiceMng/unOpenInvoiceRecord',
                status: 1
            },
            kpylcx: {
                name: '发票库存管理',
                path: '/salerInvoiceMng/leftInvoiceStock',
                status: 1
            },
            wkpsjcx: {
                name: '未开票数据查询',
                path: '/salerInvoiceMng/notInvoiceRecord',
                status: 1
            },
            hzxxb: {
                name: '红字信息表',
                path: '/salerInvoiceMng/dedicatedInvoice',
                status: 1
            }
        }
    },
    jxgl: {
        name: '进项发票管理',
        icon: jxfpglIcon,
        status: 1,
        children: {
            wdfp: {
                name: '我的发票',
                path: '/incomeMng/myInvoice',
                status: 2
            },
            dzcy: {
                name: '单张查验',
                path: '/incomeMng/singleCheck',
                status: 2
            },
            plcy: {
                name: '批量查验',
                path: '/incomeMng/multiCheck',
                status: 1
            },
            jxygx: {
                name: '预勾选',
                path: '/incomeMng/preWorkbench',
                status: 1
            },
            jxgzt: {
                name: '勾选认证',
                path: '/incomeMng/workbench',
                status: 1
            },
            lvysdk: {
                name: '旅客运输抵扣',
                path: '/incomeMng/inputDkInvoice',
                status: 1
            },
            fpyj: {
                name: '发票预警',
                path: '/incomeMng/invoiceWarning',
                status: 1
            },
            xzfp: {
                name: '发票下载',
                path: '/incomeMng/downloadInvoice',
                status: 1
            },
            multiInvoiceCheck: {
                name: '发票采集',
                path: '/inputAccount/multiInvoiceCheck',
                status: 1
            },
            govDownLoad: {
                name: '税局下票',
                path: '/inputAccount/govDownLoad',
                status: 1
            },
            statics: {
                name: '数据统计',
                path: '/inputAccount/statics',
                status: 1
            },
            queryInvoices: {
                name: '发票查询',
                path: '/inputAccount/queryInvoices',
                status: 1
            },
            accountManage: {
                name: '台账管理',
                path: '/inputAccount/accountManage',
                status: 1
            },
            invoiceCheck: {
                name: '发票查验',
                path: '/incomeMng/invoiceCheck',
                status: 1
            },
            fpjb: {
                name: '发票解绑',
                path: '/incomeMng/invoiceUnlock',
                status: 1
            },
            fphgpz: {
                name: '发票合规性配置',
                path: '/inputAccount/invoiceConfig',
                status: 1
            },
            fphgbg: {
                name: '发票合规性报告',
                path: '/inputAccount/invoiceReport',
                status: 1
            },
            dsfzxpz: {
                name: '第三方在线配置',
                path: '/incomeMng/thirdPartyOnlineConfig',
                status: 1
            },
            fpzspz: {
                name: '发票助手配置',
                path: '/incomeMng/fpzsConfig',
                status: 1
            }
        }
    },
    nssb: {
        name: '一般纳税人增值税', //纳税申报
        icon: taxReportIcon,
        status: 3,
        children: {
            g3DeclarationForm: {
                name: '申报表编制',
                path: '/taxReport/declarationFormMaking',
                status: 1
            },
            addedTax: {
                name: '申报底稿管理',
                path: '/reportDraft/addedTax/index',
                status: 1
            }
        }
    },
    systemSetting: {
        name: '系统设置',
        icon: paraSetIcon,
        status: 2,
        children: {
            taxParaSet: {
                name: '税务参数设置',
                path: '/systemSetting/taxParaSet',
                status: 2
            }
        }
    },
    tjcxkb: {
        name: '统计查询看板',
        icon: staticsIcon,
        status: 3,
        children: {
            blocTaxProcess: {
                path: '/staticsBoard/blocTaxProcess',
                name: '集团纳税进度监控看板',
                status: 1
            }
        }
    },
    jdkp: {
        name: '酒店开票',
        icon: hotelInvoiceIcon,
        status: 1,
        children: {
            hotelFpxxcsh: {
                status: 1,
                name: '发票信息初始化',
                path: '/business-cms-web/jdkp/invoiceInit'
            },
            hotelSsflbmpz: {
                status: 1,
                name: '税收分类编码配置',
                path: '/business-cms-web/jdkp/taxConf'
            },
            hotelDkpzd: {
                status: 1,
                name: '待开票账单',
                path: '/business-cms-web/jdkp/undoBill'
            },
            hotelYkpzd: {
                status: 1,
                name: '已开票账单',
                path: '/business-cms-web/jdkp/doneBill'
            },
            hotelDzkp: {
                status: 1,
                name: '单张开票',
                path: '/business-cms-web/jdkp/singleInvoice'
            },
            hotelFplb: {
                status: 1,
                name: '发票列表',
                path: '/business-cms-web/jdkp/invoiceList'
            },
            hotelKptj: {
                status: 1,
                name: '开票统计',
                path: '/business-cms-web/jdkp/invoiceSum'
            },
            hotelClientInfo: {
                status: 1,
                name: '客户信息管理',
                path: '/business-cms-web/jdkp/clientInfo'
            }
        }
    },
    orderManage: {
        name: '订货管理',
        icon: orderManageIcon,
        status: 1,
        children: {
            manageOrder: {
                name: '订单管理',
                path: '/orderManage/manageOrder',
                status: 1
            },
            rightQuery: {
                name: '权益查询',
                path: '/orderManage/rightQuery',
                status: 1
            }
        }
    },
    dataDownload: {
        name: '数据下载',
        icon: dataDownloadIcon,
        status: 1,
        children: {
            invoiceData: {
                name: '发票数据下载',
                path: '/dataDownload/invoiceData',
                status: 1
            }
        }
    }
};