import './commons/base.less';
import 'moment/locale/zh-cn';
import GxInvoices from './gxInvoices/';
import GxAuthentication from './gxAuthentication';
import CollectInvoices from './collectInvoices/';
import DiskCollect from './collectInvoices/diskCollect';
import SlideMenuLayout from './slideMenu/slideMenuLayout';
import AccountManage from './accountManage/index';
import Statics from './accountManage/statics';
import SimpleMenuLayout from './slideMenu/simpleMenuLayout';
import FpdkLogin from './fpdkLogin/';
import GxLogs from './gxLogs/';
import QueryInvoices from './queryInvoices';
export {
    GxInvoices,
    GxAuthentication,
    CollectInvoices,
    DiskCollect,
    SlideMenuLayout,
    SimpleMenuLayout,
    AccountManage,
    Statics,
    FpdkLogin,
    GxLogs,
    QueryInvoices
};