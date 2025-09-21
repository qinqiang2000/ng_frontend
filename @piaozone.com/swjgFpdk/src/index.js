
const diskOperate = require('./diskOperate');
const loginToGov = require('./loginToGov');
const queryIncomeInvoice = require('./queryIncomeInvoice');
const gxInvoices = require('./gxInvoices');
const swjgJquery = require('./swjg_ext');
const companyInfo = require('./companyInfo');

const swjgFpdk = {
	loginToGov,
	diskOperate,
	queryIncomeInvoice,	
	gxInvoices,
	swjgJquery,
	companyCredit: companyInfo
};

window.swjgFpdk = swjgFpdk;

module.exports = swjgFpdk;






