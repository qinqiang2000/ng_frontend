'use strict';

var diskOperate = require('./diskOperate');
var loginToGov = require('./loginToGov');
var queryIncomeInvoice = require('./queryIncomeInvoice');
var CaCheckDialog = require('./caCheckDialog');
var gxInvoices = require('./gxInvoices');
var SbztDialog = require('./sbztTipDialog');
module.exports = {
	loginToGov: loginToGov,
	diskOperate: diskOperate,
	queryIncomeInvoice: queryIncomeInvoice,
	CaCheckDialog: CaCheckDialog.default,
	gxInvoices: gxInvoices,
	SbztDialog: SbztDialog.default
};