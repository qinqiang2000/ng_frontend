/* eslint-disable-next-line */
/* global errcodeInfo BaseService */
const apiUrl = 'http://api.ttshitu.com/predict';
// 一、图片文字类型(默认 3 数英混合)：
// 1 : 纯数字
//    1001：纯数字2
// 2 : 纯英文
// 1002：纯英文2
// 3 : 数英混合
// 1003：数英混合2
// 4 : 闪动GIF
// 7 : 无感学习(独家)
// 11 : 计算题
// 1005:  快速计算题
// 16 : 汉字
// 32 : 通用文字识别(证件、单据)
// 66:  问答题
// 49 :recaptcha图片识别
// 二、图片旋转角度类型：
// 29 :  旋转类型

// 三、图片坐标点选类型：
// 19 :  1个坐标
// 20 :  3个坐标
// 21 :  3 ~ 5个坐标
// 22 :  5 ~ 8个坐标
// 27 :  1 ~ 4个坐标
// 48 : 轨迹类型
// 四、缺口识别
// 18：缺口识别
// 五、拼图识别
// 53：拼图识别
export default class Ttshitu extends BaseService {
    toUnicode(s) {
        return s.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g, (newStr) => {
            return '\\u' + newStr.charCodeAt(0).toString(16);
        });
    }

    async recognise(base64Str, { typeid, remark = '', imageback = '' }) {
        const ctx = this.ctx;
        ctx.service.log.info('plugin start---');
        const data = {
            username: 'piaozone',
            password: 'Piao963zone',
            typeid,
            image: base64Str
        };
        ctx.service.log.info('recognise---remark---', remark);
        if (remark) {
            data.remark = this.toUnicode(remark);
        }
        if (imageback) {
            data.imageback = imageback;
        }
        const res = await ctx.helper.curl(apiUrl, {
            method: 'POST',
            data: data,
            contentType: 'json',
            dataType: 'json',
            timeout: [10000, 20000]
        });
        ctx.service.log.info('验证码识别结果', res);
        // if (res.status !== 200) {
        if (!res.success) {
            ctx.service.log.info('验证码识别服务异常', typeid);
            return errcodeInfo.govErr;
        }
        const response = res || {};
        // if (!response.success) {
        //     return {
        //         ...errcodeInfo.fpyInnerErr,
        //         description: '登录验证异常'
        //     };
        // }

        const { id, result } = response.data;
        return {
            ...errcodeInfo.success,
            id: id,
            data: result
        };
    }

    // 通用识别，默认数英混合1003, 66为问答题
    async commonRecognise(base64Str, typeId = '1003') {
        const res = await this.recognise(base64Str, {
            typeid: typeId
        });
        return res;
    }

    // 识别汉字
    async recogniseCN(base64Str) {
        const typeid = '16';
        const res = await this.recognise(base64Str, { typeid });
        return res;
    }

    // 按指定顺序获取坐标， 提示文字是图片也需要识别, 默认3-5个坐标，typeid: 22获取5-8个坐标，27获取1-4个坐标
    async getClickPosition(base64Str, tipBase64Str, typeid = '21') {
        const res1 = await this.recogniseCN(tipBase64Str);
        if (res1.errcode !== '0000') {
            return res1;
        }
        const tipRemark = res1.data;
        const res2 = await this.getQuickClickPosition(base64Str, tipRemark, typeid);
        return res2;
    }

    // 获取坐标点选坐标，提示是文字, 默认3-5个坐标，typeid: 22获取5-8个坐标，27获取1-4个坐标
    async getQuickClickPosition(base64Str, remark, typeid = '21') {
        const res = await this.recognise(base64Str, { typeid, remark });
        this.ctx.service.log.info('getQuickClickPosition', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const resData = res.data || {};
        const listArr = resData.split('|');
        return {
            ...errcodeInfo.success,
            data: listArr.map((item) => {
                const curList = item.split(',');
                return {
                    x: curList[0],
                    y: curList[1]
                };
            })
        };
    }

    // 获取滑块坐标位置，以便拖动, 是缺口左上角，拖动距离需要自己根据拖动滑块的大小加上x坐标大小
    async getSliderPosition(base64Str, imageback) {
        const typeid = '18';
        const res = await this.recognise(base64Str, {
            typeid,
            imageback
        });
        if (res.errcode !== '0000') {
            return res;
        }
        const loc = res.data.split(',');
        return {
            ...errcodeInfo.success,
            data: {
                x: loc[0],
                y: loc[1]
            }
        };
    }

    //  获取计算题结果, 默认进行简单计算，传入11可以进行复杂的计算
    async getCountResult(base64Str, typeid = '1005') {
        const res = await this.recognise(base64Str, {
            typeid
        });
        return res;
    }
}