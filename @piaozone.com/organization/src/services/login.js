
import {kdRequest} from '@piaozone.com/utils';

export async function login({phone='', type=2, passwd=''}) {	
	const res =  await kdRequest({
		url: '/base/portal/login/token',
		data: {
			"type": type,
			"userName": phone,
			"userPassword": passwd
		},
		method: 'POST'
	});
	
	return res;	
}

export async function logout() {
	const res =  await kdRequest({
		url: '/portal/org/login/userLogout',
		data: '',
		method: 'POST'
	});
	
	return res;
}

export async function changeOrg(opt){
	return await kdRequest({            
        url: '/portal/org/changeOrg',
        data: opt,
        method: 'POST'
    })
}

export async function thirdLoginByAuthCode(opt){
	return await kdRequest({            
        url: '/base/portal/kd/sso/login/getLoginInfo',
        data: opt,
        method: 'POST'
    })
}

