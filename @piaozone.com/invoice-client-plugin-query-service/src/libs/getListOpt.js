/* eslint-disable */
// import moment from 'moment';

//新版税局循环采集时获取当前参数和下一步参数
export function getListOptV4(opt, nextFlag, resInfo = {}, nextNum = 1) { //默认取一个
    let { errcode, nextDataIndex = 0, totalNum = 0 } = resInfo;
    let optListIndex = opt.dataFromIndex;
    if (optListIndex === '' || typeof optListIndex === 'undefined') {
        optListIndex = 0;
    } else if (typeof optListIndex === 'string') {
        optListIndex = parseInt(optListIndex);
    }
    const searchOpt = opt.searchOpt;
    let rzzt = searchOpt.rzzt;

    let glzt = searchOpt.glzt || searchOpt.manageStatus;
    if (typeof glzt === 'undefined') {
        glzt = -1;
    }

    searchOpt.glzt = glzt; // 管理状态默认为-1全部

    if (typeof rzzt === 'undefined') {
        rzzt = '';
    } else {
        rzzt = rzzt.toString();
    }

    let gxzt = searchOpt.gxzt;
    if (typeof gxzt === 'undefined') {
        gxzt = '-1';
    } else {
        gxzt = gxzt.toString();
    }

    const dataFrom = opt.dataFrom || '';
    const rq_q = searchOpt.rq_q;
    const rq_z = searchOpt.rq_z;
    const maxRq = rq_z ? moment(rq_z, 'YYYY-MM-DD') : moment();
    const getDktjListOpt = (id = '') => {
        const startRq_q = rq_q || moment().format('YYYY-MM-DD');
        let intStartRq_q = moment(startRq_q, 'YYYY-MM-DD');

        if (nextFlag) {
            if (errcode !== '0000' || nextDataIndex >= totalNum) {
                nextDataIndex = 0;
            }
        } else {
            nextDataIndex = opt.dataIndex;
        }

        const result = [];
        while (intStartRq_q.format('X') <= maxRq.format('X')) {
            const searchParam = { ...searchOpt };
            let name = '';
            if (id === 'dkmx') {
                name = '抵扣发票';
            } else if (id === 'ckznxmx') {
                name = '出口转内销发票';
            } else if (id === 'dkycfpmx') {
                name = '抵扣异常发票';
            } else if (id === 'dkycckznxfpmx') {
                name = '抵扣异常出口转内销发票';
            }
            result.push({
                ...opt,
                searchOpt: {
                    ...searchParam,
                    rq_q: intStartRq_q.format('YYYY-MM-DD'),
                    id
                },
                dataIndex: nextDataIndex,
                dataFrom: 'dktjQuery',
                name,
                rzssq: intStartRq_q.format('YYYY-MM')
            });

            intStartRq_q = intStartRq_q.add(1, 'month');
        }
        return result;
    };

    if (nextFlag) {
        if (nextDataIndex >= totalNum || errcode !== '0000') {
            nextDataIndex = 0;
            optListIndex += 1;
        }
    } else {
        nextDataIndex = opt.dataIndex;
    }

    let list = [];
    const wdqOpt = {
        ...opt,
        searchOpt: {
            ...searchOpt,
            fphm: searchOpt.fphm || '',
            fpdm: searchOpt.fpdm || '',
            kprq_q: rq_q,
            kprq_z: rq_z,
            cxfw: searchOpt.cxfw || '0'
        },
        dataIndex: nextDataIndex,
        dataFrom: 'wdqQuery',
        name: '未到期发票'
    };

    if (rzzt !== '1' && (dataFrom === '' || dataFrom === 'dkgxquery')) { //抵扣勾选税局通过rzzt参数查询，这里入口统一为gxzt
        if (gxzt === '-1') {
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '0' }, dataIndex: nextDataIndex, dataFrom: 'dkgxquery', name: '当前属期未勾选发票' });
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '1' }, dataIndex: nextDataIndex, dataFrom: 'dkgxquery', name: '当前属期抵扣已勾选发票' });
        } else if (gxzt === '0') {
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '0' }, dataIndex: nextDataIndex, dataFrom: 'dkgxquery', name: '当前属期未勾选发票' });
        } else if (gxzt === '1') {
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '1' }, dataIndex: nextDataIndex, dataFrom: 'dkgxquery', name: '当前属期抵扣已勾选发票' });
        }
    }

    if (rzzt !== '1' && (dataFrom === '' || dataFrom === 'bdkgxquery')) {
        const bdkgxOpt = {
            ...opt,
            searchOpt: {
                ...searchOpt,
                rq_q,
                rq_z,
                rzzt: '1'
            },
            dataIndex: nextDataIndex,
            dataFrom: 'bdkgxquery',
            name: '当前属期不抵扣已勾选发票'
        };

        if (gxzt === '-1') {
            if (dataFrom === 'bdkgxquery') {
                list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '0' }, dataIndex: nextDataIndex, dataFrom: 'bdkgxquery', name: '当前属期不抵扣未勾选发票' });
                list.push(bdkgxOpt);
            } else { //为空时未勾选的发票在前面的步骤已经采集
                console.log('-----------------bdkgxquery---------------------------------')
                list.push(bdkgxOpt);
            }
        } else if (gxzt === '0' && (dataFrom === 'bdkgxquery')) {
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '0' }, dataIndex: nextDataIndex, dataFrom: 'bdkgxquery', name: '当前属期不抵扣未勾选发票' });
        } else if (gxzt === '1' && (dataFrom === '' || dataFrom === 'bdkgxquery')) {
            list.push(bdkgxOpt);
        }
    }

    // 未到期发票可以单独查询
    if (rzzt !== '1' && gxzt !== '1' && opt.exclude !== 'wdqQuery' && dataFrom === '') {
        list.push(wdqOpt);
    }

    if (rzzt !== '0' && (dataFrom === '' || dataFrom === 'dktjQuery')) {
        let searchId = searchOpt.id;
        if (typeof searchId === 'undefined') { // 字段不传时，默认下载dkmx
            searchId = 'dkmx';
        }

        if (searchId === '') {
            list = list.concat(getDktjListOpt('dkmx'));
            // list = list.concat(getDktjListOpt('ckznxmx'));
            // list = list.concat(getDktjListOpt('dkycfpmx'));
            // list = list.concat(getDktjListOpt('dkycckznxfpmx'));
        } else if (searchId === 'dkmx') {
            list = list.concat(getDktjListOpt('dkmx'));
        } else if (searchId === 'ckznxmx') {
            list = list.concat(getDktjListOpt('ckznxmx'));
        } else if (searchId === 'dkycfpmx') {
            list = list.concat(getDktjListOpt('dkycfpmx'));
        } else if (searchId === 'dkycckznxfpmx') {
            list = list.concat(getDktjListOpt('dkycckznxfpmx'));
        }
    }

    if (optListIndex >= list.length) {
        return { index: -1 };
    } else {
        return { index: optListIndex, opt: list[optListIndex] };
    }
}



// 电子税局循环采集时获取当前参数和下一步参数
export function getEtaxListOpt(opt, nextFlag, resInfo = {}, nextNum = 1) { //默认取一个
    let { errcode, nextDataIndex = 0, totalNum = 0 } = resInfo;
    let optListIndex = opt.dataFromIndex;
    if (optListIndex === '' || typeof optListIndex === 'undefined') {
        optListIndex = 0;
    } else if (typeof optListIndex === 'string') {
        optListIndex = parseInt(optListIndex);
    }
    const searchOpt = opt.searchOpt;
    let authenticateFlagArr;
    if (!searchOpt.authenticateFlags) {
        authenticateFlagArr = ['0', '1', '2', '3'];
    } else {
        authenticateFlagArr = searchOpt.authenticateFlags.split(',');
    }

    const dataFrom = opt.dataFrom || '';
    const rq_q = searchOpt.startTime;
    const rq_z = searchOpt.endTime;
    const maxRq = rq_z ? moment(rq_z, 'YYYY-MM-DD') : moment();
    const getDktjListOpt = (id = '') => {
        const startRq_q = rq_q || moment().format('YYYY-MM-DD');
        let intStartRq_q = moment(startRq_q, 'YYYY-MM-DD');

        if (nextFlag) {
            if (errcode !== '0000' || nextDataIndex >= totalNum) {
                nextDataIndex = 0;
            }
        } else {
            nextDataIndex = opt.dataIndex;
        }

        const result = [];
        while (intStartRq_q.format('X') <= maxRq.format('X')) {
            const searchParam = { ...searchOpt };
            const name = '抵扣发票';
            result.push({
                ...opt,
                searchOpt: {
                    ...searchParam,
                    rzssq: intStartRq_q.format('YYYYMM'),
                    id
                },
                dataIndex: nextDataIndex,
                dataFrom: 'dktjQuery',
                name
            });

            intStartRq_q = intStartRq_q.add(1, 'month');
        }
        return result;
    };


    if (nextFlag) {
        if (nextDataIndex >= totalNum || errcode !== '0000') {
            nextDataIndex = 0;
            optListIndex += 1;
        }
    } else {
        nextDataIndex = opt.dataIndex;
    }

    let list = [];
    const wdqOpt = {
        ...opt,
        searchOpt: {
            ...searchOpt,
        },
        dataIndex: nextDataIndex,
        dataFrom: 'wdqQuery',
        name: '未到期发票'
    };

    // 抵扣勾选税局通过rzzt参数查询
    if ((dataFrom === '' || dataFrom === 'dkgxquery')) {
        if (authenticateFlagArr.indexOf('0') !== -1) {
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '0' }, dataIndex: nextDataIndex, dataFrom: 'dkgxquery', name: '当前属期未勾选发票' });
        }
        if (authenticateFlagArr.indexOf('1') !== -1) {
            list.push({ ...opt, searchOpt: { ...searchOpt, rzzt: '1' }, dataIndex: nextDataIndex, dataFrom: 'dkgxquery', name: '当前属期抵扣已勾选发票' });
        }
    }

    // 不抵扣已勾选
    if (authenticateFlagArr.indexOf('1') !== -1 && (dataFrom === '' || dataFrom === 'bdkgxquery')) {
        list.push({
            ...opt,
            searchOpt: {
                ...searchOpt,
                rzzt: '1'
            },
            dataIndex: nextDataIndex,
            dataFrom: 'bdkgxquery',
            name: '当前属期不抵扣已勾选发票'
        });
    }

    // 未到期发票可以单独查询
    if (authenticateFlagArr.indexOf('0') !== -1 && opt.exclude !== 'wdqQuery') {
        list.push(wdqOpt);
    }

    if (authenticateFlagArr.indexOf('2') !== -1 && (dataFrom === '' || dataFrom === 'dktjQuery')) {
        list = list.concat(getDktjListOpt('dkmx'));
    }
    if (optListIndex >= list.length) {
        return { index: -1 };
    } else {
        return { index: optListIndex, opt: list[optListIndex] };
    }
}

// 获取海关缴款书，参数列表
export const getJksListOpt = function(opt, nextFlag, resInfo = {}) {
    let { errcode, nextDataIndex = 0, totalNum = 0 } = resInfo;
    let optListIndex = opt.dataFromIndex;
    const dataFrom = opt.dataFrom || '';
    if (optListIndex === '' || typeof optListIndex === 'undefined') {
        optListIndex = 0;
    } else if (typeof optListIndex === 'string') {
        optListIndex = parseInt(optListIndex);
    }

    if (nextFlag) {
        if (nextDataIndex >= totalNum || errcode !== '0000') {
            nextDataIndex = 0;
            optListIndex += 1;
        }
    } else {
        nextDataIndex = opt.dataIndex || 0;
    }

    let list = [];
    const searchOpt = opt.searchOpt;
    const rzzt = typeof searchOpt.rzzt === 'undefined' ? -1 : searchOpt.rzzt; // -1, 0, 1
    const glzt = typeof searchOpt.glzt === 'undefined' ? -1 : searchOpt.glzt; // -1, 0, 1
    const gxzt = typeof searchOpt.gxzt === 'undefined' ? -1 : searchOpt.gxzt; // -1, 0, 1
    const rq_q = searchOpt.rq_q;
    const rq_z = searchOpt.rq_z;
    const maxRq = rq_z ? moment(rq_z, 'YYYY-MM-DD') : moment();

    const getDktjListOpt = () => {
        const startRq_q = rq_q || moment().format('YYYY-MM-DD');
        let intStartRq_q = moment(startRq_q, 'YYYY-MM-DD');

        if (nextFlag) {
            if (errcode !== '0000' || nextDataIndex >= totalNum) {
                nextDataIndex = 0;
            }
        } else {
            nextDataIndex = opt.dataIndex || 0;
        }

        const result = [];
        while (intStartRq_q.format('X') < maxRq.format('X')) {
            result.push({
                ...opt,
                searchOpt: {
                    ...searchOpt,
                    gxzt: 1,
                    rzzt: 1,
                    rq_q: intStartRq_q.format('YYYY-MM-DD')
                },
                dataIndex: nextDataIndex,
                dataFrom: 'dktjquery',
                name: '抵扣统计海关缴款书'
            });

            intStartRq_q = intStartRq_q.add(1, 'month');
        }

        return result;
    };

    if (rzzt === -1 || rzzt === 0) {
        if (gxzt === -1 || gxzt === 0) {
            if (dataFrom === 'dkgxquery' || dataFrom === '') {
                list.push({
                    ...opt,
                    searchOpt: {
                        ...searchOpt,
                        glzt,
                        gxzt: 0,
                        rzzt: 0
                    },
                    dataIndex: nextDataIndex,
                    dataFrom: 'dkgxquery',
                    name: '当前属期抵扣未勾选海关缴款书'
                });
            } else if (dataFrom === 'bdkgxquery') {
                list.push({
                    ...opt,
                    searchOpt: {
                        ...searchOpt,
                        glzt,
                        gxzt: 0,
                        rzzt: 0
                    },
                    dataIndex: nextDataIndex,
                    dataFrom: 'bdkgxquery',
                    name: '当前属期不抵扣未勾选海关缴款书'
                });
            }
        }

        if (gxzt === -1 || gxzt === 1) {
            if (dataFrom === '' || dataFrom === 'dkgxquery') {
                list.push({
                    ...opt,
                    searchOpt: {
                        ...searchOpt,
                        glzt,
                        gxzt: 1,
                        rzzt: 0
                    },
                    dataIndex: nextDataIndex,
                    dataFrom: 'dkgxquery',
                    name: '当前属期抵扣已勾选海关缴款书'
                });
            }

            if (dataFrom === 'bdkgxquery' || dataFrom === '') {
                list.push({
                    ...opt,
                    searchOpt: {
                        ...searchOpt,
                        glzt,
                        gxzt: 1,
                        rzzt: 0
                    },
                    dataIndex: nextDataIndex,
                    dataFrom: 'bdkgxquery',
                    name: '当前属期不抵扣已勾选海关缴款书'
                });
            }
        }
    }

    if ((rzzt === -1 || rzzt === 1) && (dataFrom === 'dktjquery' || dataFrom === '')) {
        list = list.concat(getDktjListOpt());
    }

    if (optListIndex >= list.length) {
        return { index: -1 };
    } else {
        return { index: optListIndex, opt: list[optListIndex] };
    }
};