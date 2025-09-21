import { urlHandler } from '@piaozone.com/utils';
// import { govFpdkOperate } from '@piaozone.com/swjgFpdkV4';
const PAGE_PRE_PATH = '/fpdk-web';
const searchStr = window.location.search || 'access_token=895aa7b18ba09674b391dc1ed97aafd6&diskInfo=91440300358768292H%2C12345678%2C%2Chttp%253A%252F%252F127.0.0.1%253A52320%252Fcryptctl%3D91440300358768292H%2C12345678%2C%2Chttp%253A%252F%252F127.0.0.1%253A52320%252Fcryptctl';
const urlSearchInfo = urlHandler.urlSearch(searchStr);
let { access_token = '', diskInfo } = urlSearchInfo;

let diskInfoArr = [];

if (diskInfo) {
    const infoArr = decodeURIComponent(diskInfo).split('=');
    for (let i = 0; i < infoArr.length; i++) {
        const item = infoArr[i].split(',');
        diskInfoArr.push({
            taxNo: decodeURIComponent(item[0]),
            password: decodeURIComponent(item[1]),
            ptPassword: decodeURIComponent(item[2]),
            operateUrl: decodeURIComponent(item[3])
        });
    }
}

const firstLoginUrl = '/fpdk/firstLogin'; //税局第一次登录
const secondLoginUrl = '/fpdk/secondLogin'; //税局第二次登录

export default {
    namespace: 'fpdkInfo',
    state: {
        firstLoginUrl,
        secondLoginUrl,
        recognizeUrl: '/portal/bm/ocr/recognition/image',
        checkInvoiceUrl: '/portal/bm/ocr/check/invoice/data',
        collectUrl: '/portal/fpdk/queryInvoice', //采集税局发票url
        dkgxUrl: '/portal/fpdk/dkgx/gxInvoices', //抵扣勾选
        bdkgxUrl: '/portal/fpdk/bdkgx/gxInvoices', //不抵扣勾选
        gxConfirmUrl: '/portal/fpdk/dkgx/gxConfirm', //勾选确认url
        searchTjUrl: '/portal/fpdk/dkgx/dqtjcx', //查询统计url
        qxtjUrl: '/portal/fpdk/dkgx/qxdktjbb', //取消统计url
        sctjUrl: '/portal/fpdk/dkgx/scdktjbb', //生成统计url
        dkgxSearchUrl: '/portal/fpdk/dkgx/search',
        downloadAccountQueryUrl: '/fpdk/m17/bill/download/invoice/account/query',
        downloadApplyUrl: '/fpdk/download/manual/apply',
        access_token,
        PAGE_PRE_PATH,
        diskInfoIndex: 0,
        diskInfoArr: diskInfoArr
    },
    subscriptions: {
        async setup(props) { // eslint-disable-line

        }
    },
    effects: {

    },

    reducers: {
        switchFpdkInfo(state, { payload: { data } }) {

        },
        updateToken(state, action) {
            const { index, access_token } = action.payload;
            return {
                ...state,
                access_token: access_token,
                diskInfoIndex: index
            };
        }
    }
};
