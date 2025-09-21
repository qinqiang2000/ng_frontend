// import React, { useState } from 'react';
// import PropTypes from 'prop-types';
// import { Button, DatePicker, Input, Select, Tooltip, Icon } from 'antd';
// import moment from 'moment';
// import { INPUT_INVOICE_TYPES, invoice_expense_status, invoiceStatus } from '@piaozone.com/fpdk-gov-client/src/commons/constants';
// import InvoiceSource from '@piaozone.com/fpdk-gov-client/src/invoiceSource';
// const { Option } = Select;
// const { RangePicker, MonthPicker } = DatePicker;
// // 勾选状态
// const ALL_ISFAUTHENTICATE = [
//     { text: '未勾选', value: 0 },
//     { text: '预勾选', value: 5 },
//     { text: '已勾选', value: 1 },
//     { text: '已认证', value: 2 }
// ];

// // 抵扣状态
// const ALL_DEDUCTIONPURPOSE = [
//     { text: '已抵扣', value: '1' },
//     { text: '不抵扣', value: '2' },
//     { text: '未抵扣', value: '0' }
// ];

// //采集日期 开票日期   审核通过时间  发票使用状态 采集人手机号 采集人名称 系统来源  单据审核人

// const AccountSearch = function({ searchOpt, userSource, getInvoiceSourceUrl, gitReviewerUrl, isAddedTax, onChangeSearch, onSearch, emptyClick }) {
//     // 分众添加的搜索条件
//     const [showMore, setShowMore] = useState(false);
//     const otherItems = (
//         <>
//             <div className='searchItem inlineBlock'>
//                 <InvoiceSource
//                     placeHolderTxt='请输入发票的来源业务系统'
//                     title='来源系统列表'
//                     labelName='系统来源'
//                     name='expenseSystemSource'
//                     onOk={(val) => { onChangeSearch({ searchOpt: { ...searchOpt, expenseSystemSource: val } }); }}
//                     getListUrl={getInvoiceSourceUrl}
//                 />
//             </div>
//             <div className='searchItem inlineBlock'>
//                 <InvoiceSource
//                     placeHolderTxt='请输入发票的审核人'
//                     title='系统审核人列表'
//                     labelName='单据审核人'
//                     name='expenseReviewer'
//                     onOk={(val) => { onChangeSearch({ searchOpt: { ...searchOpt, expenseReviewer: val } }); }}
//                     getListUrl={gitReviewerUrl}
//                 />
//             </div>
//         </>
//     );
//     return (
//         <div className='topBtns'>
//             <div className={!showMore ? 'row minHeight' : 'row'} style={{ maxWidth: 1300, display: 'inline-block' }}>
//                 <div className='searchItem inlineBlock'>
//                     <label>发票种类：</label>
//                     <Select
//                         value={searchOpt.invoiceType}
//                         style={{ width: 220 }}
//                         onChange={(v) => {
//                             onChangeSearch({
//                                 searchOpt: {
//                                     ...searchOpt,
//                                     invoiceType: v
//                                 }
//                             });
//                         }}
//                     >
//                         <Option value=''>全部</Option>
//                         {
//                             INPUT_INVOICE_TYPES.map((item) => {
//                                 return (
//                                     <Option value={item.value} key={item.value}>{item.text}</Option>
//                                 );
//                             })
//                         }
//                     </Select>
//                 </div>
//                 <div className='searchItem inlineBlock'>
//                     <label>采集日期：</label>
//                     <RangePicker
//                         disabledDate={(current) => { return current > moment(); }}
//                         className='rangeDate' style={{ width: 220 }}
//                         onChange={(d) => onChangeSearch({ searchOpt: { ...searchOpt, collectTime: d } })}
//                         value={searchOpt.collectTime}
//                         allowClear={true}
//                     />

//                 </div>

//                 <div className='searchItem inlineBlock'>
//                     <label>开票日期：</label>
//                     <RangePicker
//                         disabledDate={(current) => { return current > moment(); }}
//                         className='rangeDate' style={{ width: 220 }}
//                         onChange={(d) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceTime: d } })}
//                         value={searchOpt.invoiceTime}
//                         allowClear={true}
//                     />
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>发票代码：</label>
//                     <Input
//                         placeholder='输入发票代码'
//                         type='text'
//                         maxLength={12}
//                         className='searchInput' style={{ width: 220 }}
//                         onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceCode: e.target.value } })}
//                         value={searchOpt.invoiceCode}
//                     />
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>发票号码：</label>
//                     <Input
//                         maxLength={10}
//                         placeholder='输入发票号码'
//                         type='text'
//                         className='searchInput' style={{ width: 220 }}
//                         onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceNo: e.target.value } })}
//                         value={searchOpt.invoiceNo}
//                     />
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>发票是否查验：</label>
//                     <div style={{ display: 'inline-block', width: 220 }}>
//                         <span
//                             className={searchOpt.isCheck == '1' ? 'active checkItem' : 'checkItem'}
//                             onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, isCheck: '1' } }); }}
//                         >
//                             是
//                         </span>
//                         <span
//                             className={searchOpt.isCheck == '2' ? 'active checkItem' : 'checkItem'}
//                             onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, isCheck: '2' } }); }}
//                         >
//                             否
//                         </span>
//                     </div>
//                 </div>

//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>发票状态：</label>
//                     <Select
//                         style={{ width: 220 }}
//                         value={searchOpt.invoiceStatus}
//                         onChange={(v) => onChangeSearch({ searchOpt: { ...searchOpt, invoiceStatus: v } })}
//                     >
//                         <Option value=''>全部</Option>
//                         {
//                             invoiceStatus.map((item, index) => {
//                                 return <Option value={item.value} key={item.value}>{item.text}</Option>;
//                             })
//                         }
//                     </Select>
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>销方名称：</label>
//                     <Input
//                         placeholder='请输入企业名称'
//                         type='text'
//                         className='searchInput' style={{ width: 220 }}
//                         onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, salerName: e.target.value } })}
//                         value={searchOpt.salerName}
//                     />
//                 </div>
//                 {
//                     userSource != '8' ? (
//                         <div className='searchItem inlineBlock'>
//                             <label>发票使用状态：</label>
//                             <Select
//                                 style={{ width: 220 }}
//                                 value={searchOpt.expendStatus}
//                                 onChange={(v) => onChangeSearch({
//                                     searchOpt: {
//                                         ...searchOpt,
//                                         expendStatus: v,
//                                         accountDate: v === 65 || v === '' ? searchOpt.accountDate : null
//                                     }
//                                 })}
//                             >
//                                 <Option value=''>全部</Option>
//                                 {
//                                     invoice_expense_status.map((item) => {
//                                         return <Option value={item.value} key={item.value}>{item.text}</Option>;
//                                     })
//                                 }
//                             </Select>
//                         </div>
//                     ) : null
//                 }
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>业务单号：</label>
//                     <Input
//                         placeholder='请输入业务单号'
//                         type='text'
//                         className='searchInput' style={{ width: 220 }}
//                         onChange={(e) => onChangeSearch({ searchOpt: { ...searchOpt, expenseNum: e.target.value } })}
//                         value={searchOpt.expenseNum}
//                     />
//                 </div>
//                 <div className='searchItem inlineBlock'>
//                     <label>审核通过时间：</label>
//                     <RangePicker
//                         disabledDate={(current) => { return current > moment(); }}
//                         className='rangeDate' style={{ width: 220 }}
//                         onChange={(d) => onChangeSearch({ searchOpt: { ...searchOpt, expendTime: d } })}
//                         value={searchOpt.expendTime}
//                         allowClear={true}
//                     />
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>入账属期：</label>
//                     <MonthPicker
//                         value={searchOpt.accountDate}
//                         placeholder='请选择入账属期'
//                         disabled={searchOpt.expendStatus !== 65 && searchOpt.expendStatus !== ''}
//                         format='YYYYMM'
//                         onChange={(e) => { onChangeSearch({ searchOpt: { ...searchOpt, accountDate: e } }); }}
//                         disabledDate={(c) => {
//                             return c.format('X') > moment().endOf('month').format('X');
//                         }}
//                         style={{ width: 220 }}
//                     />
//                 </div>
//                 <div className='searchItem inlineBlock'>
//                     <label>采集人手机号：</label>
//                     <Input
//                         type='text'
//                         style={{ width: 220 }}
//                         value={searchOpt.collectUser}
//                         maxLength={11}
//                         onChange={
//                             (e) => {
//                                 onChangeSearch({ searchOpt: { ...searchOpt, collectUser: e.target.value.replace(/[^0-9]/g, '') } });
//                             }
//                         }
//                     />
//                 </div>
//                 <div className='searchItem inlineBlock'>
//                     <label>采集人名称：</label>
//                     <Input
//                         type='text'
//                         style={{ width: 220 }}
//                         value={searchOpt.collectorName}
//                         maxLength={11}
//                         onChange={(e) => { onChangeSearch({ searchOpt: { ...searchOpt, collectorName: e.target.value } }); }}
//                     />
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>勾选状态：</label>
//                     <Select
//                         style={{ width: 220 }}
//                         value={searchOpt.isFauthenticate}
//                         onChange={(v) => onChangeSearch({ searchOpt: { ...searchOpt, isFauthenticate: v } })}
//                     >
//                         <Option value=''>全部</Option>
//                         {
//                             ALL_ISFAUTHENTICATE.map(item => {
//                                 return <Option value={item.value} key={item.value}>{item.text}</Option>;
//                             })
//                         }
//                     </Select>
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>认证日期：</label>
//                     <RangePicker
//                         disabled={searchOpt.isFauthenticate !== 2}
//                         disabledDate={(current) => { return current > moment(); }}
//                         className='rangeDate'
//                         style={{ width: 220 }}
//                         onChange={(v) => onChangeSearch({ searchOpt: { ...searchOpt, authInvoiceDate: v } })}
//                         value={searchOpt.authInvoiceDate}
//                     />
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label>纸票是否签收：</label>
//                     <div style={{ display: 'inline-block' }}>
//                         <span
//                             className={searchOpt.signOptionValue == '' ? 'active checkItem' : 'checkItem'}
//                             onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, signOptionValue: '' } }); }}
//                         >
//                             全部
//                         </span>
//                         <span
//                             className={searchOpt.signOptionValue == '1' ? 'active checkItem' : 'checkItem'}
//                             onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, signOptionValue: '1' } }); }}
//                         >
//                             是
//                         </span>
//                         <span
//                             className={searchOpt.signOptionValue == '2' ? 'active checkItem' : 'checkItem'}
//                             onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, signOptionValue: '2' } }); }}
//                         >
//                             否
//                         </span>
//                     </div>
//                 </div>
//                 <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                     <label style={{ width: 156 }}>发票抬头是否一致：</label>
//                     <span
//                         className={searchOpt.equalNameValue == '' ? 'active checkItem' : 'checkItem'}
//                         onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, equalNameValue: '' } }); }}
//                     >
//                         全部
//                     </span>
//                     <span
//                         className={searchOpt.equalNameValue == 1 ? 'active checkItem' : 'checkItem'}
//                         onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, equalNameValue: 1 } }); }}
//                     >
//                         是
//                     </span>
//                     <span
//                         className={searchOpt.equalNameValue == 2 ? 'active checkItem' : 'checkItem'}
//                         onClick={() => { onChangeSearch({ searchOpt: { ...searchOpt, equalNameValue: 2 } }); }}
//                     >
//                         否
//                     </span>
//                 </div>
//                 {
//                     userSource != '8' ? (
//                         <div className={isAddedTax ? 'searchItem inlineBlock' : 'searchItem inlineBlock hidden'}>
//                             <label>抵扣状态：</label>
//                             <Select
//                                 style={{ width: 220 }}
//                                 value={searchOpt.deductionPurpose}
//                                 onChange={(v) => onChangeSearch({ searchOpt: { ...searchOpt, deductionPurpose: v } })}
//                             >
//                                 <Option value=''>全部</Option>
//                                 {
//                                     ALL_DEDUCTIONPURPOSE.map(item => {
//                                         return <Option value={item.value} key={item.value}>{item.text}</Option>;
//                                     })
//                                 }
//                             </Select>
//                         </div>
//                     ) : null
//                 }
//                 {otherItems}
//             </div>
//             <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
//                 <Tooltip title='采集日期过滤查询不到发票时，建议使用开票日期过滤查询'>
//                     <Button type='primary' onClick={onSearch}>查询</Button>
//                 </Tooltip>
//                 <Button className='btn' icon='reload' onClick={emptyClick} style={{ borderStyle: 'none', marginLeft: 15 }}>清空</Button>
//             </div>
//             <div className='moreTip' style={{ textAlign: 'center' }}>
//                 {
//                     showMore ? (
//                         <span onClick={() => setShowMore(false)}>收起更多<Icon size='small' type='up' /></span>
//                     ) : (
//                         <span onClick={() => setShowMore(true)}>显示更多搜索条件<Icon size='small' type='down' /></span>
//                     )
//                 }
//             </div>
//         </div>
//     );
// };

// AccountSearch.propTypes = {
//     searchOpt: PropTypes.object,
//     userSource: PropTypes.string,
//     isAddedTax: PropTypes.bool,
//     getInvoiceSourceUrl: PropTypes.func,
//     gitReviewerUrl: PropTypes.func,
//     onChangeSearch: PropTypes.func,
//     onSearch: PropTypes.func,
//     emptyClick: PropTypes.func
// };

// export default AccountSearch;