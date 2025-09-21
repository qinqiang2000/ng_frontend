
var diskOperate = require('./diskOperate');
var loginToGov = require('./loginToGov');
var queryIncomeInvoice = require('./queryIncomeInvoice');
var gxInvoices = require('./gxInvoices');
var swjgJquery = require('./swjg_ext');
var companyInfo = require('./companyInfo');

var swjgFpdk = {
	loginToGov: loginToGov,
	diskOperate: diskOperate,
	queryIncomeInvoice: queryIncomeInvoice,
	gxInvoices: gxInvoices,
	swjgJquery: swjgJquery,
	companyCredit: companyInfo
};

window.swjgFpdk = swjgFpdk;

module.exports = swjgFpdk;