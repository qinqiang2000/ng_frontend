
const diskOperate = require('./diskOperate');
const govFpdkOperate = require('./govFpdkOperate');

const swjgFpdk = {
    diskOperate,
    govFpdkOperate: (()=>{
        var instance;
        var instanceDict = {}; //根据税号来控制多个
        var _static = {
            name: 'SingleGovFpdkOperate',
            getInstance: (options) => {
                if(typeof instance === 'undefined'){
                    instance = new govFpdkOperate.default(options);
                }
                return instance;
            },
            getNewInstance: (options) => {
                instance = null;
                instance = new govFpdkOperate.default(options);
                return instance;
            },
            getInstanceByTaxNo: (options) => {
                const taxNo = options.taxNo || 'fixedTaxNo'; //不传则只支持单税号
                if(instanceDict[taxNo]){
                    return instanceDict[taxNo];
                }else{
                    instanceDict[taxNo] = new govFpdkOperate.default({...options, taxNo});
                    return instanceDict[taxNo];
                }
            }
        }
        return _static;
    })()
};


window.swjgFpdk = swjgFpdk;

// if(typeof module === 'object'){
//     module.exports = swjgFpdk;
// }
