import * as loginService from '../services/login';

let preLoginInfo = sessionStorage.getItem('loginInfo');
let preCurrentOrgId = sessionStorage.getItem('currentOrgId');
let preCurrentOrgName = sessionStorage.getItem('currentOrgName');
let preBelongOrgId = sessionStorage.getItem('preBelongOrgId');
let preBelongOrgName = sessionStorage.getItem('preBelongOrgName');

if(preLoginInfo){
	preLoginInfo = JSON.parse(preLoginInfo);
}else{
	preLoginInfo = {};
	preCurrentOrgId = '';
	preCurrentOrgName = '';
	preBelongOrgId = '';
	preBelongOrgName = '';
}
export default {
    namespace: 'login',
    state: {
    	currentOrgId: preCurrentOrgId,
    	currentOrgName: preCurrentOrgName,
    	currentBelongOrgId:  preBelongOrgId,
    	currentBelongOrgName: preBelongOrgName,
        loginInfo: preLoginInfo  //用户信息            
    },
    reducers: {
        userInfo(state, { payload: { data: loginInfo } }) {
        	sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));
            return { ...state, loginInfo};
        },
        setCurOrg(state, {payload: {currentOrgId=preCurrentOrgId, currentOrgName = preCurrentOrgName, currentBelongOrgId=preBelongOrgId, currentBelongOrgName=preBelongOrgName}}){
        	sessionStorage.setItem('currentOrgId', currentOrgId);            
            sessionStorage.setItem('currentOrgName', currentOrgName);
            sessionStorage.setItem('currentBelongOrgId', currentBelongOrgId);
            sessionStorage.setItem('currentBelongOrgName', currentBelongOrgName);
        	return { ...state, currentOrgId, currentOrgName, currentBelongOrgId, currentBelongOrgName};
        }
    },
    effects: {
        *clogin({ payload: { phone = '', passwd='', type=2 } }, { call, put }){
        	const res = yield call(loginService.login, { phone, passwd, type });
            if(res.errcode === '0000'){            
	            yield put({
	                type: 'userInfo',
	                payload: {
	                    data: res.data
	                }
	            });
	            
	            yield put({
	                type: 'setCurOrg',
	                payload: {	                	
	                	currentOrgId: res.data.faffiliatedOrgId, 
	                	currentOrgName:res.data.faffiliatedOrgname,
	                	currentBelongOrgId: res.data.faffiliatedOrgId,
	                	currentBelongOrgName: res.data.faffiliatedOrgname
	                }	                
	            });
	            
            }
            return res;            
        },
        *thirdLoginByAuthCode({ payload: opt }, { call, put }){
        	const res = yield call(loginService.thirdLoginByAuthCode, opt);
            if(res.errcode === '0000'){            
	            yield put({
	                type: 'userInfo',
	                payload: {
	                    data: res.data
	                }
	            });
	            
	            yield put({
	                type: 'setCurOrg',
	                payload: {	                	
	                	currentOrgId: res.data.faffiliatedOrgId, 
	                	currentOrgName:res.data.faffiliatedOrgname,
	                	currentBelongOrgId: res.data.faffiliatedOrgId,
	                	currentBelongOrgName: res.data.faffiliatedOrgname
	                }	                
	            });
	            
            }
            return res;            
        },
        *logout({ payload: { } }, { call, put }){
        	const res = yield call(loginService.logout, {});
        	sessionStorage.clear();
        	if(res.errcode === '0000'){
        		yield put({
	                type: 'userInfo',
	                payload: {
	                    data: {}
	                }
	          });	            
	          localStorage.clear();		            
        	}        	
          	return res;
        },
        *changeCurOrg({ payload: opt }, { call, put }){
        	const res = yield call(loginService.changeOrg, opt);
        	
        	const {currentOrgId = preCurrentOrgId, currentOrgName = preCurrentOrgName, currentBelongOrgId = preBelongOrgId, currentBelongOrgName = preBelongOrgName} = opt;
        	
        	if(res.errcode === '0000'){
        		yield put({
	                type: 'setCurOrg',
	                payload: {
	                    currentOrgId,
	                    currentOrgName,
	                    currentBelongOrgId,
	                    currentBelongOrgName
	                }
	         	});
        	}        	
          	return res;
        }
    },
    subscriptions: {}
};