
import immutable from 'immutable';
const jxfpglIcon = require('../img/jxfpgl.svg');
const xxfpglIcon = require('../img/xxfpgl.svg');
const PAGE_PRE_PATH = '';

const menuConfig = immutable.fromJS([{
    fid: 1,
    name: '进项管理',
    icon: jxfpglIcon,
    menuConfig: [{
        fid: 11,
        name: '采集发票',
        path: PAGE_PRE_PATH + '/fpdk-web/collectInvoices'
    }, {
        fid: 12,
        name: '勾选认证',
        path: PAGE_PRE_PATH + '/fpdk-web/gxInvoices'
    }, {
        fid: 13,
        name: '台账管理',
        path: PAGE_PRE_PATH + '/fpdk-web/accountManage'
    }]
}, {
    fid: 2,
    name: '销项管理',
    icon: xxfpglIcon,
    menuConfig: [{
        fid: 21,
        name: '单张开票',
        path: PAGE_PRE_PATH + '/fpdk-web/outputInvoice/openInvoice/single'
    }, {
        fid: 22,
        name: '批量开票',
        path: PAGE_PRE_PATH + '/fpdk-web/outputInvoice/openInvoice/multi'
    }, {
        fid: 23,
        name: '开票查询',
        path: PAGE_PRE_PATH + '/fpdk-web/outputInvoice/invoiceQuery'
    }]
}]);

const getInitMenuConfig = function(config, pathName) {
    for (let i = 0; i < config.size; i++) {
        const curConfig = config.get(i);
        if (curConfig.get('path') === pathName) {
            return config.setIn([i, 'active'], true);
        } else if (curConfig.get('menuConfig').size > 0) {            
            for (let j = 0; j < curConfig.get('menuConfig').size; j++) {
                const subConfig = curConfig.get('menuConfig').get(j);
                if (subConfig.get('path') === pathName) {
                    return config.setIn([i, 'active'], true).setIn([i, 'menuConfig', j, 'active'], true);
                }
            }            
        }
    }
    return config;
};

export default {
    namespace: 'menuLayout',
    state: {
        hoverMenu: false,
        menuConfig: []
    },
    subscriptions: {
        async setup({ dispatch, history }) { // eslint-disable-line                
            const tempConfig = getInitMenuConfig(menuConfig, history.location.pathname);
            dispatch({
                type: 'setMenuConfig',
                payload: {
                    menuConfig: tempConfig.toJS()
                }
            });
        }
    },
    effects: {

    },

    reducers: {        
        setMenuConfig(state, action) {
            return {
                ...state,
                menuConfig: action.payload.menuConfig
            };
        },
        changeRoute(state, action) {
            const { pIndex, subIndex } = action.payload;
            return {
                ...state,
                menuConfig: menuConfig.setIn([pIndex, 'active'], true).setIn([pIndex, 'menuConfig', subIndex, 'active'], true).toJS()
            };
        },
        changeMenuHover(state, action) {
            const { hoverMenu } = action.payload;
            return {
                ...state,
                hoverMenu
            };
        }
    }
};  
