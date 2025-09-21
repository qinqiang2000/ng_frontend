
var citys=[
	{'code':'1100','sfmc':'北京','Ip':'https://zjfpcyweb.bjsat.gov.cn:443','address':'https://zjfpcyweb.bjsat.gov.cn:443'},
    {'code':'1200','sfmc':'天津','Ip':'https://fpcy.tjsat.gov.cn:443','address':'https://fpcy.tjsat.gov.cn:443'},
    {'code':'1300','sfmc':'河北','Ip':'https://fpcy.he-n-tax.gov.cn:82','address':'https://fpcy.he-n-tax.gov.cn:82'},
    {'code':'1400','sfmc':'山西','Ip':'https://fpcy.tax.sx.cn:443','address':'https://fpcy.tax.sx.cn:443'},
    {'code':'1500','sfmc':'内蒙古','Ip':'https://fpcy.nm-n-tax.gov.cn:443','address':'https://fpcy.nm-n-tax.gov.cn:443'},
    {'code':'2100','sfmc':'辽宁','Ip':'https://fpcy.tax.ln.cn:443','address':'https://fpcy.tax.ln.cn:443'},
    {'code':'2102','sfmc':'大连','Ip':'https://fpcy.dlntax.gov.cn:443','address':'https://fpcy.dlntax.gov.cn:443'},
    {'code':'2200','sfmc':'吉林','Ip':'https://fpcy.jl-n-tax.gov.cn:4432','address':'https://fpcy.jl-n-tax.gov.cn:4432'},
    {'code':'2300','sfmc':'黑龙江','Ip':'https://fpcy.hl-n-tax.gov.cn:443','address':'https://fpcy.hl-n-tax.gov.cn:443'},
    {'code':'3100','sfmc':'上海','Ip':'https://fpcyweb.tax.sh.gov.cn:1001','address':'https://fpcyweb.tax.sh.gov.cn:1001'},
    {'code':'3200','sfmc':'江苏','Ip':'https://fpdk.jsgs.gov.cn:80','address':'https://fpdk.jsgs.gov.cn:80'},
    {'code':'3300','sfmc':'浙江','Ip':'https://fpcyweb.zjtax.gov.cn:443','address':'https://fpcyweb.zjtax.gov.cn:443'},
    {'code':'3302','sfmc':'宁波','Ip':'https://fpcy.nb-n-tax.gov.cn:443','address':'https://fpcy.nb-n-tax.gov.cn:443'},
    {'code':'3400','sfmc':'安徽','Ip':'https://fpcy.ah-n-tax.gov.cn:443','address':'https://fpcy.ah-n-tax.gov.cn:443'},
    {'code':'3500','sfmc':'福建','Ip':'https://fpcyweb.fj-n-tax.gov.cn:443','address':'https://fpcyweb.fj-n-tax.gov.cn:443'},
    {'code':'3502','sfmc':'厦门','Ip':'https://fpcy.xm-n-tax.gov.cn','address':'https://fpcy.xm-n-tax.gov.cn'},
    {'code':'3600','sfmc':'江西','Ip':'https://fpcy.jxgs.gov.cn:82','address':'https://fpcy.jxgs.gov.cn:82'},
    {'code':'3700','sfmc':'山东','Ip':'https://fpcy.sd-n-tax.gov.cn:443','address':'https://fpcy.sd-n-tax.gov.cn:443'},
    {'code':'3702','sfmc':'青岛','Ip':'https://fpcy.qd-n-tax.gov.cn:443','address':'https://fpcy.qd-n-tax.gov.cn:443'},
    {'code':'4100','sfmc':'河南','Ip':'https://fpcy.ha-n-tax.gov.cn','address':'https://fpcy.ha-n-tax.gov.cn'},
    {'code':'4200','sfmc':'湖北','Ip':'https://fpcy.hb-n-tax.gov.cn:443','address':'https://fpcy.hb-n-tax.gov.cn:443'},
    {'code':'4300','sfmc':'湖南','Ip':'https://fpcy.hntax.gov.cn:8083','address':'https://fpcy.hntax.gov.cn:8083', strictHttps: true},
    {'code':'4400','sfmc':'广东','Ip':'https://fpcy.gd-n-tax.gov.cn:443','address':'https://fpcy.gd-n-tax.gov.cn:443'},
    {'code':'4403','sfmc':'深圳','Ip':'https://fpcy.szgs.gov.cn:443','address':'https://fpcy.szgs.gov.cn:443'},
    {'code':'4500','sfmc':'广西','Ip':'https://fpcy.gxgs.gov.cn:8200','address':'https://fpcy.gxgs.gov.cn:8200'},
    {'code':'4600','sfmc':'海南','Ip':'https://fpcy.hitax.gov.cn:443','address':'https://fpcy.hitax.gov.cn:443'},
    {'code':'5000','sfmc':'重庆','Ip':'https://fpcy.cqsw.gov.cn:80','address':'https://fpcy.cqsw.gov.cn:80'},
    {'code':'5100','sfmc':'四川','Ip':'https://fpcy.sc-n-tax.gov.cn:443','address':'https://fpcy.sc-n-tax.gov.cn:443'},
    {'code':'5200','sfmc':'贵州','Ip':'https://fpcy.gz-n-tax.gov.cn:80','address':'https://fpcy.gz-n-tax.gov.cn:80'},
    {'code':'5300','sfmc':'云南','Ip':'https://fpcy.yngs.gov.cn:443','address':'https://fpcy.yngs.gov.cn:443'},
    {'code':'5400','sfmc':'西藏','Ip':'https://fpcy.xztax.gov.cn:81','address':'https://fpcy.xztax.gov.cn:81'},
    {'code':'6100','sfmc':'陕西','Ip':'https://fpcyweb.sn-n-tax.gov.cn:443','address':'https://fpcyweb.sn-n-tax.gov.cn:443'},
    {'code':'6200','sfmc':'甘肃','Ip':'https://fpcy.gs-n-tax.gov.cn:443','address':'https://fpcy.gs-n-tax.gov.cn:443'},
    {'code':'6300','sfmc':'青海','Ip':'https://fpcy.qh-n-tax.gov.cn:443','address':'https://fpcy.qh-n-tax.gov.cn:443'},
    {'code':'6400','sfmc':'宁夏','Ip':'https://fpcy.nxgs.gov.cn:443','address':'https://fpcy.nxgs.gov.cn:443'},
    {'code':'6500','sfmc':'新疆','Ip':'https://fpcy.xj-n-tax.gov.cn:443','address':'https://fpcy.xj-n-tax.gov.cn:443'}];
    

var fpdkCitys = [{
	"city": "安徽",
	"url": "https://fpdk.anhui.chinatax.gov.cn/"
}, {
	"city": "北京",
	"url": "https://fpdk.beijing.chinatax.gov.cn/"
}, {
	"city": "重庆",
	"url": "https://fpdk.chongqing.chinatax.gov.cn/"
}, {
	"city": "大连",
	"url": "https://fpdk.dlntax.gov.cn/"
}, {
	"city": "福建",
	"url": "https://fpdk.fujian.chinatax.gov.cn/"
}, {
	"city": "甘肃",
	"url": "https://fpdk.gansu.chinatax.gov.cn/"
}, {
	"city": "广东",
	"url": "https://fpdk.gd-n-tax.gov.cn/"
}, {
	"city": "广西",
	"url": "https://fpdk.guangxi.chinatax.gov.cn/"
}, {
	"city": "贵州",
	"url": "https://fpdk.gz-n-tax.gov.cn/"
}, {
	"city": "海南",
	"url": "https://fpdk.hitax.gov.cn/"
}, {
	"city": "河南",
	"url": "https://fpdk.henan.chinatax.gov.cn/"
}, {
	"city": "河北",
	"url": "https://fpdk.he-n-tax.gov.cn:81/"
}, {
	"city": "黑龙江",
	"url": "https://fpdk.hl-n-tax.gov.cn/"
}, {
	"city": "湖北",
	"url": "https://fpdk.hb-n-tax.gov.cn/"
}, {
	"city": "湖南",
	"url": "https://fpdk.hunan.chinatax.gov.cn/"
}, {
	"city": "江苏",
	"url": "https://fpdk.jiangsu.chinatax.gov.cn:81/"
}, {
	"city": "江西",
	"url": "https://fpdk.jiangxi.chinatax.gov.cn/"
}, {
    "city": "吉林",            
	"url": "https://fpdk.jilin.chinatax.gov.cn:4431/" //https://fpdk.jl-n-tax.gov.cn:4431/
}, {
	"city": "辽宁",
	"url": "https://fpdk.liaoning.chinatax.gov.cn/"
}, {
    "city": "内蒙古",            
	"url": "http://fpdk.neimenggu.chinatax.gov.cn/" //"https://fpdk.nm-n-tax.gov.cn/"
}, {
	"city": "宁波",
    "url": "https://fpdk.ningbo.chinatax.gov.cn/",
    "path": "NSbsqWW",
    "loginFunType": "01"
}, {
	"city": "宁夏",
	"url": "https://fpdk.ningxia.chinatax.gov.cn/"
}, {
	"city": "青岛",
	"url": "https://fpdk.qingdao.chinatax.gov.cn/"
}, {
	"city": "青海",
	"url": "http://fpdk.qh-n-tax.gov.cn/"
}, {
	"city": "山东",
	"url": "https://fpdk.shandong.chinatax.gov.cn/"
}, {
	"city": "上海",
	"url": "https://fpdk.tax.sh.gov.cn/"
}, {
	"city": "山西",
	"url": "https://fpdk.shanxi.chinatax.gov.cn/"
}, {
	"city": "陕西",
	"url": "https://fpdk.shaanxi.chinatax.gov.cn/"
}, {
	"city": "深圳",
	"url": "https://fpdk.shenzhen.chinatax.gov.cn/"
}, {
	"city": "首都",
	"url": "http://172.30.11.88:90/"
}, {
	"city": "四川",
	"url": "https://fpdk.sichuan.chinatax.gov.cn/"
}, {
	"city": "天津",
	"url": "https://fpdk.tianjin.chinatax.gov.cn/"
}, {
	"city": "厦门",
	"url": "https://fpdk.xiamen.chinatax.gov.cn/"
}, {
	"city": "新疆",
	"url": "https://fpdk.xj-n-tax.gov.cn/"
}, {
	"city": "西藏",
	"url": "https://fpdk.xztax.gov.cn/"
}, {
	"city": "云南",
	"url": "https://fpdk.yngs.gov.cn/"
}, {
	"city": "浙江",
	"url": "https://fpdk.zhejiang.chinatax.gov.cn/"
}]

var fullCitys = [];
var fullUrls = [];

for(var i=0;i<fpdkCitys.length;i++){
    fullCitys.push(fpdkCitys[i].city);
    fullUrls.push(fpdkCitys[i].url);
}


var getCityNameByTaxNo = function (taxNo){     
    if(taxNo !== ''){
        var code = '';
        
        if(taxNo.length === 18){ //三证合一税号
            code = taxNo.substr(2, 4);            
        }else if(taxNo.length === 15){
            code = taxNo.substr(0, 4);
        }else{
            return false;
        }
        
        var cityItem = citys.filter( function(item){
            return item.code === code;            
        });
        
        if(cityItem.length !== 0){
            return cityItem[0].sfmc;
        }else{ //查找不到用前两位加上00进行查找
            code = code.substr(0, 2) + '00';
            cityItem = citys.filter( function(item) {
                return item.code === code;
            });
            
            if(cityItem.length !== 0){
                return cityItem[0].sfmc;
            }else{
                return false;
            }
        }
    }
    return false;
}


var getBaseUrl = function (cityName, joinPath) {
    var index = fullCitys.indexOf(cityName); 
    if(index !== -1){
        if(!joinPath){
            return fullUrls[index];
        }else{
            return fullUrls[index] + (fpdkCitys[index].path?fpdkCitys[index].path:'SbsqWW') + '/';
        }
        
    }else{
        return false;
    }
}

var getFpdkInfo = function(cityName){
    var index = fullCitys.indexOf(cityName); 
    if(index !== -1){
        return fpdkCitys[index];
    }else{
        return false;
    }
}

var getCityInfo = function(cityName){
	var info = false;
	for(var i=0;i<citys.length;i++){
		if(citys[i].sfmc === cityName){
			info = citys[i];
			break;
		}		
	}
	return info;
}

var getCityInfoByInvoiceCode = function(fpdm){
    var dqdm = null;
    var resultInfo = {};
    if (fpdm.length == 12) {
        dqdm = fpdm.substring(1, 5);
    } else {
        dqdm = fpdm.substring(0, 4);
    } if (dqdm !== '2102' && dqdm !== '3302' && dqdm !== '3502' && dqdm !== '3702' && dqdm !== '4403') {
        dqdm = dqdm.substring(0, 2) + '00';
    }

    for (var i = 0; i < citys.length; i++) {
        if (dqdm == citys[i].code) {
            resultInfo.name = citys[i].sfmc;
            resultInfo.code = dqdm;
            break
        }
    }

    return resultInfo;
}


module.exports = {
    getBaseUrl: getBaseUrl,
    getFpdkInfo: getFpdkInfo,
	getCityNameByTaxNo: getCityNameByTaxNo,
    getCityInfo: getCityInfo,
    getFpdkCitys: fpdkCitys,
    getCityInfoByInvoiceCode: getCityInfoByInvoiceCode
}
