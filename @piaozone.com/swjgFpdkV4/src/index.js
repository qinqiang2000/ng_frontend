
import * as diskOperateDefault from './diskOperate';
import * as diskApiDefault from './diskApi';
import * as checkApiVersionDefault from './checkApiVersion';
import multiPortDiskOperate from './multiPortDiskOperate';
import fpdkOperateDefault from './govFpdkOperate';


export const fpdkOperate = fpdkOperateDefault;
export const MultiPortDiskOperate = multiPortDiskOperate;
export const diskApi = diskApiDefault;
export const checkApiVersion = checkApiVersionDefault;
export const diskOperate = diskOperateDefault;
export const govFpdkOperate = (() => {
    var instance;
    var instanceDict = {}; //根据税号来控制多个
    var _static = {
        name: 'SingleGovFpdkOperate',
        getInstance: (options) => {
            if(typeof instance === 'undefined'){
                instance = new fpdkOperate(options);
            }
            return instance;
        },
        getNewInstance: (options) => {
            instance = null;
            instance = new fpdkOperate(options);
            return instance;
        },
        getInstanceByTaxNo: (options) => {
            const taxNo = options.taxNo || 'fixedTaxNo'; //不传则只支持单税号
            if(instanceDict[taxNo]){
                return instanceDict[taxNo];
            }else{
                instanceDict[taxNo] = new fpdkOperate({...options, taxNo});
                return instanceDict[taxNo];
            }
        }
    }
    return _static;
})();