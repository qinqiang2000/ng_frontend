var async = require('async');
var pwyScanFiles = require('./scanfiles');
var asyncScanfiles = require('./asyncScanfiles');
var epsScanFiles = require('./epsScanFiles');
var DWObjectUploadFile = function(path, data, fileIndex, itemHanlder){
    var port = window.location.port == "" ? 80 : window.location.port;
    var url = window.location.hostname + ':' + port + path;
    var random = (+new Date()) + '-' + fileIndex;
    window.DWObject.ClearAllHTTPFormField();
    window.DWObject.SetHTTPFormField('exceltxt_' + fileIndex, data, 'JPG_image_' + random + '.jpg');
    window.DWObject.HTTPUpload(url, function(res) {}, function(err, msg, httpResponse){
        try{
            var res = JSON.parse(httpResponse);
            itemHanlder(res);
        }catch(e){
            itemHanlder({'errcode':'serverErr', description: '服务端异常!'});
        }
    });
}

var convertImage = function(i, itemHanlder){
    window.DWObject.ConvertToBlob(
    [i],
    window.EnumDWT_ImageType.IT_JPG,
    function (result) {
    	itemHanlder(true, result);
    }, function(errorCode, errorString) {
    	itemHanlder(false, {errcode:'uploadScannerErr', description: "ErrorCode: " + errorCode + "\r" + "ErrorString:" + errorString});
    });
}


var asyncConvertImage = function(i){
    return new Promise((resolve) => {
        window.DWObject.ConvertToBlob(
        [i],
        window.EnumDWT_ImageType.IT_JPG,
        function (result) {
            resolve({errcode: '0000', data: result});
        }, function(errorCode, errorString) {
            console.warn(errorCode, errorString);
            resolve({errcode: 'covertErr', description: errorString});
        });
    });
}


var uploadScanFile = function(path, i, itemHanlder, tempPort){
    var port = 80;
    var urlPort = window.location.port;
    var ifSsl = false;
    if(!urlPort){
        if(window.location.protocol.indexOf('https') !== -1){
            urlPort = 443;
            ifSsl = true;
        }else{
            urlPort = 80;
        }
    }

    window.DWObject.HTTPPort = urlPort;

    if(ifSsl){
        window.DWObject.IfSSL = true;
    }

    window.DWObject.HTTPUploadThroughPost(
        window.location.hostname,
        i,
        path,
        'imageData_'+ i +'.jpg',
        function(){},
        function (err, msg, httpResponse){

        	var res = '';
            try{
                res = JSON.parse(httpResponse);
            }catch(e){
            	// console.log(e);
            	itemHanlder({'errcode':'jsonErr', description: '服务端异常!'}, i);
            }

            if(res !== ''){
            	itemHanlder(res, i);
            }
        }
    );
}


var uploadScanFiles = function(opt){
	var fileIndex = opt.fileIndex || 0;
	var port = opt.port || 80;
	//默认清理
	var removeImageFlag = opt.removeImageFlag === false? false:true;

	var path = opt.path || '';
    var stepFinish = opt.stepFinish || function(){};
    var preStepFinish = opt.preStepFinish;
	var finish = opt.finish || function(){};
	var limit = opt.limit || 20;
	var formField = opt.formField || 'exceltxt';
    window.DWObject.IfShowProgressBar = false;
    window.DWObject.IfShowCancelDialogWhenImageTransfer = false;
    window.DWObject.ClearAllHTTPFormField();
    window.DWObject.SetHTTPFormField(formField, window.DWObject.HowManyImagesInBuffer);

    window.DWObject.ScanedInvoiceLen = 0;
    window.DWObject.UploadedScanedInvoiceLen = 0;

    var len = window.DWObject.HowManyImagesInBuffer;

    var convertResult = [];
    var uploadFuns = [];

    if(len === 0 || path === ''){
    	return;
    }

    //异步处理
    (function next(i){
		uploadFuns[i] = async function(done) {
            let stopStepUpload = false;
            let preRes;
            if(typeof preStepFinish === 'function') {
                const cRes = await asyncConvertImage(i);
                preRes = await preStepFinish(cRes, i) || {};
                stopStepUpload = !!preRes.stopStepUpload;
            }

            if(!stopStepUpload) {
                uploadScanFile(path, i, function(res, fileNumber){
                    try{
                        stepFinish(res, fileNumber, preRes);
                    }catch(e){
                        console.log(e);
                        //TODO handle the exception
                    }
                    return done(null, res);
                }, port)
            }
		}

		if((i+1)<len){
			next(i+1);
		}else{
			async.parallelLimit(uploadFuns, limit, function(err, results){
				if(removeImageFlag){
					window.DWObject.RemoveAllImages();
					window.DWObject.CloseSource();
				}

	    		finish(results);
	    	});
		}
	})(fileIndex);
}


var scanFiles = function(opt){
    var path = opt.path || '';
	var fileIndex = opt.fileIndex || 0;
	var stepFinish = opt.stepFinish || function(){};
	var finish = opt.finish || function(){};
	var initFail = opt.initFail || function(){};
	var startUpload = opt.startUpload || function(){};

	var limit = opt.limit || 20;
	var PixelType = opt.PixelType || 2; //彩色模式
	var Resolution = opt.Resolution || 300; //300dpi
	if(window.DWObject){
        //如果只有一台扫描仪，直接进行扫描，不用选择

        if(window.DWObject.SourceCount > 1){
            window.DWObject.SelectSource();
        }else{
            window.DWObject.SelectSourceByIndex(0);
        }

        window.DWObject.OpenSource();
        window.DWObject.PixelType  = PixelType; //彩色模式
        window.DWObject.Resolution = Resolution; //300dpi
        window.DWObject.IfDisableSourceAfterAcquire = true;

        window.DWObject.AcquireImage(function(){
        	const len = window.DWObject.HowManyImagesInBuffer;
        	if(len > fileIndex){
        		startUpload(len);
        		uploadScanFiles(opt);
        	}else{
        		window.DWObject.CloseSource();
        	}
        }, function(err, msg) {
        	initFail({errcode: err, description: msg});
        	window.DWObject.CloseSource();
        });
    }else{
    	initFail({errcode: 'initErr', description: '初始化扫描设备失败!'});
    }
}

module.exports = {
    scanFiles,
    PwyScanFiles: pwyScanFiles.ScanFiles,
    PwyAsyncScanFiles: asyncScanfiles.AsyncScanFiles,
    EpsAsyncScanFiles: epsScanFiles.AsyncScanFiles,
	uploadScanFiles,
	uploadScanFile,
    convertImage,
    asyncConvertImage,
	DWObjectUploadFile
}
