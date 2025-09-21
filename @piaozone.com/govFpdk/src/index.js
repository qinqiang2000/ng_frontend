const diskOperate = require('./diskOperate');
const loginToGov = require('./loginToGov');
const queryIncomeInvoice = require('./queryIncomeInvoice');
const CaCheckDialog = require('./caCheckDialog');
const gxInvoices = require('./gxInvoices');
const SbztDialog = require('./sbztTipDialog');
module.exports = {
	loginToGov,	
	diskOperate,
	queryIncomeInvoice,
	CaCheckDialog: CaCheckDialog.default,
	gxInvoices,
	SbztDialog: SbztDialog.default
}