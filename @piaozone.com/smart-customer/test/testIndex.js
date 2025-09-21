import getSmartCustomerInstance from "../src/";
import store from '../src/store/index';
import { setAppAndModule } from '../src/store/appAndModule';

const st = getSmartCustomerInstance({
    cssUrl: 'https://img-sit.piaozone.com/static/public/js/smartCustomer.min.js'
});
st.init({
    "phone": "17299999999",
    "taxNo": "915003006188392540",
    appText: '开票管理',
    moduleText: '所有开票申请单',
    hotKeys: ['ctrl', 'shift', 'k']
});

$('#homepagetabap').on('click', '.kd-cq-homepage-tab-item', function() {
    $(this).addClass('kd-cq-homepage-tab-item-active').siblings().removeClass('kd-cq-homepage-tab-item-active');
});

$('#tabap').on('click', '.kd-cq-tabs-tab', function() {
    $('#tabap .kd-cq-tabs-tab .tab').removeClass('tab-active');
    $(this).find('.tab').addClass('tab-active');
})

$('#refresh').on('click', function() {
    // const appAndModuleInfo = useSelector((state) => state.appAndModule);
    // console.log('old appAndModuleInfo', appAndModuleInfo);
    const newInfo = {version: 'v1', appText: '开票管理', moduleText: '所有开票申请单'};
    console.log('store', store.getState());
    store.dispatch(setAppAndModule(newInfo));
})