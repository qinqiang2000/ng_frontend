export const invocieTypeIconDict = {
    k1: ['dzfp.png', '电子普通发票', 1],
    k2: ['dzfp.png', '电子专用发票', 2],
    k3: ['zhipiao.png', '纸质普通发票', 3],
    k4: ['zhuanpiao.png', '纸质专用发票', 4],
    k5: ['jp.png', '纸质卷式普通发票', 5],
    k7: ['jdp.png', '通用机打票', 7],
    k8: ['dsp.png', '的士发票', 8],
    k9: ['hcp.png', '火车票', 9],
    k10: ['fjp.png', '飞机票', 10],
    k11: ['qtp.png', '其它发票', 11],
    k12: ['djc.png', '机动车发票', 12],
    k13: ['esc.png', '二手车发票', 13], //无购方和销方税号
    k14: ['dep.png', '定额票', 14],
    k15: ['txf.png', '通行费电子发票', 15],
    k16: ['kyp.png', '客运发票', 16],
    k17: ['glgq.png', '过路过桥费', 17],
    k19: ['gzsfp.png', '完税证明', 19],
    k20: ['lcp.png', '轮船票', 20],
    k23: ['jdp.png', '通用机打电子发票', 23],
    k21: ['jksIcon.png', '海关缴款书', 21],
    k24: ['hctpIcon.png', '火车票退票凭证', 24],
    k25: ['czpjIcon.png', '财政电子票据', 25],
    k26: ['alldp.png', '数电普票', 26],
    k27: ['alldz.png', '数电专票', 27],
    k28: ['allAir.png', '数电航空', 28],
    k29: ['allTrain.png', '数电铁路', 29],
    k83: ['alldjdc.png', '数电机动车', 83],
    k84: ['alldesc.png', '数电二手车', 84]
};

//已经实现查验的发票
export const allowCheckInvoice = [1, 2, 3, 4, 5, 12, 13, 15];
export const noInvoiceTitle = [8, 9, 10, 11, 14, 16, 17];

export const billTypeDict = {
    Tra: '差旅报销单',
    Pur: '智能采购单',
    BizOut: '对公报销单'
};

export const bxStatusDict = {
    k0: '未报销',
    k1: '未报销',
    k2: '已打包',
    k25: '已提交',
    k30: '审批中',
    k60: '审批通过',
    k65: '等待付款',
    k70: '已付款',
    k27: '已废弃',
    k40: '审核不通过',
    k80: '已关闭'
};

export const checkStatusDict = {
    k1: ['dataxf.png', '数据相符'],
    k3: ['databf.png', '数据不相符'],
    k2: ['databf.png', '未查验或查验失败']
};
