
var io = require('socket.io-client');
var hex_md5 = require('md5-hex');

Function.prototype.method = function(name, func){
	if(!this.prototype[name]){	
		this.prototype[name] = func;
	}
	return this;
}

//某些浏览器不支持IndexOf
Array.method('indexOf', function(value){
	var i,
		len = this.length;
	for(i=0;i<len;i++){
		if(this[i] === value){
			return i;
		}
	}
	return -1;
});


function PwyWebSocket(opt, ioObject){
	this.io = io || ioObject;
	this.onError = opt.onError || function(){};
	this.fromType = opt.fromType || 'third'; //默认来自第三方third, pwy
	this.sourceType = opt.sourceType || 'socket'; //第三方获取数据的方式，默认socket
	
	var defaultTransports = ['socket', 'polling']; //默认的数据传输方式
	if(!typeof window.postMessage === 'function'){
		defaultTransports = ['socket', 'polling'];
	}
	
    if(opt.name != ''){
    	
        this.transports = window.WebSocket ? opt.transports || defaultTransports : ['polling'];
        
    	this.name = hex_md5(opt.name);
    	this.client_id = opt.client_id || 'vc0c6hjlgnKCic';
    	this.tin = opt.tin || '440301999999980';
    	this.sign = opt.sign || '7158858eb2ee6b36381e85a6279b153d';
    	this.timestamp = opt.timestamp || '1556262656725';
		this.eid = opt.eid || 'eid';
		
		var env = opt.env || 'old';
        
        if(env === 'local'){
            this.baseApiUrl = opt.apiUrl || 'http://172.18.5.39:9104';
			this.url = opt.url || 'http://172.18.5.39:9092';
			this.path = opt.path || '';
        }else if(env === 'prod'){
			this.baseApiUrl = opt.apiUrl || 'https://api.piaozone.com';
			this.url = opt.url || 'https://link.piaozone.com';
			this.path = opt.path || '';
		}else if(env === 'test'){
			this.baseApiUrl = opt.apiUrl || 'https://api-dev.piaozone.com/test';
			this.url = opt.url || 'https://link-test.piaozone.com';
			this.path = opt.path || '';
		}else if(env === 'demo'){
			this.baseApiUrl = opt.apiUrl || 'https://api-dev.piaozone.com';
			this.url = opt.url || 'https://link.piaozone.com';
			this.path = opt.path || '';
		}else if(env === 'dev'){
			this.baseApiUrl = opt.apiUrl || 'http://172.18.5.39:9104';
			this.url = opt.url || 'http://172.18.5.39:9092';
			this.path = opt.path || '';
		}else{ //旧版
			this.baseApiUrl = opt.apiUrl || 'https://api.piaozone.com';
			this.url = opt.url || 'https://wss.piaozone.com';
			this.path = opt.path || '/bill-socket/socket.io';
		}

		
		this.sourceType = opt.sourceType || 'socket';
    	this.socketIoTransports = opt.socketIoTransports || ['websocket', 'polling'];
        this.onOpen = opt.onOpen || function(){};
        
        this.onClose = opt.close || function() {};
        this.retryFlag = true;
		this.ws = null;
		
		this.socketConnected = false;
		this.isPolling = false;

		this.pollingRequest = false; //当前的request请求

		this.socketRetryTimes = 0; //socket重建连接次数
		this.socketRetryMaxTimes = 3; //socket重建连接最大次数，超过这个次数会强制转到厂轮询
		this.pongTimeoutNum = 0; //pong超时触发次数
		this.pongTimeoutMaxNum = 3; //pong超时触发最大次数，超过3次数会直接进入长轮询
		this.defaultPingTimeout = 500; // 超过500ms算超时一次

        this.receivedMessage = [];
        this.debug = (opt.debug === true)?true:false;
        
		
		var self = this;
		this.onMessage = function(msg, handerOk, handerFail){
			typeof opt.onMessage === 'function' && opt.onMessage(msg, handerOk, handerFail);			
        };
        
        this.getToken(function(resToken){        	
        	if(resToken.errcode !== '0000'){
        		self.onError('获取token异常', '0025710000007401');
        	}else{        		
        		if(typeof self.io === 'undefined'){
					self.startPolling(true);
				}else{
					//socket不允许，就使用polling方式
		        	if(self.transports.indexOf('socket') !== -1) {
		        		self.init();
		        	}else if(self.transports.indexOf('polling') !== -1) {
		        		self.startPolling(true);
		        	}
				};
        	}
        })          
    }else{
    	this.onError('参数不完整', '0025710000007400');
    }
}

PwyWebSocket.prototype = {
    md5: function(s){
        return hex_md5(s);
    },
	getToken: function(handler){
		var url = this.baseApiUrl + '/base/fpzs/polling/oauth/token?client_id=' + this.client_id + '&tin=' + this.tin + '&sign=' + this.sign + '&timestamp=' + this.timestamp + '&eid=' + encodeURIComponent(this.eid);
		var self = this;
		this.sendJsonp(url + '&jsonpCallback=?', function(res){
			if(res.errcode === '0000'){
				self.access_token = res.access_token;
			}else{
				self.consoleLog('获取token异常：', res);
			}
			handler(res);
		}, function(errRes){
			handler({'errcode': 'tokenErr', 'description': '获取token出错'});
		})
	},
	pollingReply: function(messageId, cback){
        var self = this;
        
		var tempUrl = this.baseApiUrl + '/polling/fpzs/portal/receipt?access_token='+ this.access_token + '&key='+ encodeURIComponent(this.name) +'&msgId=' + messageId;

		this.consoleLog('开始消息服务端回复');
		this.sendJsonp(tempUrl + '&jsonpCallback=?', function(res){
			self.consoleLog('消息服务端回复成功');
			typeof cback === 'function' && cback();
		}, function(res){
			self.consoleLog('消息服务端回复失败');
			typeof cback === 'function' && cback();
		})
	},	
	getUUId: function(){		
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  	var r = (d + Math.random()*16)%16 | 0;
		  	d = Math.floor(d/16);
		  	return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	},
	getShortUUId: function(){		
		var d = new Date().getTime();
		var uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  	var r = (d + Math.random()*16)%16 | 0;
		  	d = Math.floor(d/16);
		  	return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	},
	consoleLog: function(n, err){
		if(this.debug && window.console){
			if(typeof err === 'undefined'){
				window.console.log(n);
			}else{
				window.console.log(n, err);
			}
			
		}
	},
	consoleWarn: function(err){
		if(window.console){
			window.console.warn(err);
		}
	},
	consoleError: function(err){
		if(window.console){
			window.console.error(err);
		}
	},
	handlerMsg: function(msgId, cback){
		var self = this;
		
		//消息已经处理过，去重复		
		if(typeof msgId !== 'undefined'){
			if(self.receivedMessage.indexOf(msgId) === -1){
				//消息没有重复，先回复，保存消息Id，然后处理消息事件
				self.receivedMessage.push(msgId);
				self.pollingReply(msgId);
				typeof cback === 'function' && cback();	
			}else{
				//获取到重复消息，通知服务端清理
				self.pollingReply(msgId);
				typeof cback === 'function' && cback();
			}
		}else{
			typeof cback === 'function' && cback();
		}
	},
	sendJsonp: function(url, cback, errBack){
        var self = this;
        //创建 script 标签并加入到页面中
        var callbackName = ('jsonp_' + Math.random()).replace(".", "");
        var oHead = document.getElementsByTagName('head')[0];
        // options.data[options.callback] = callbackName;
        var oS = document.createElement('script');
        oHead.appendChild(oS);

        //创建jsonp回调函数
        window[callbackName] = function (json) {            
            oHead.removeChild(oS);
            clearTimeout(oS.timer);
            window[callbackName] = null;            
            typeof cback === 'function' && cback(json);
        };

        //发送请求
        oS.src = url.replace(/\?$/, callbackName);

        //超时处理    
        oS.timer = setTimeout(function () {
            window[callbackName] = null;
            oHead.removeChild(oS);
            self.consoleError('jsonp 请求超时', url);
            typeof errBack === 'function' && errBack({'errcode': 'timeout', 'description': '请求超时'});
        }, 50000);
	},
	startPolling: function(firstFlag){ //轮询接口
		var self = this;

		if(!self.isPolling){
			self.consoleLog('开始执行轮询');
            self.isPolling = true;
            self.socketConnected = false;
			self.onOpen(self.name, '0025710000007402');
		}


		if(self.pollingRequest){			
			self.pollingRequest.abort();
		}
		var pollingUrl = self.baseApiUrl + '/polling/fpzs/portal/invoice/data/v2?access_token='+ self.access_token + '&key=' + encodeURIComponent(self.name) + '&jsonpCallback=?';
		self.pollingRequest = this.sendJsonp(pollingUrl, function(res){
			var errcode = res.errcode; 			
			if(errcode == '1300'){
				self.getToken(function(res){
					if(res.errcode === '0000'){
						self.startPolling(false);
					}else{
						self.onError(res.description, '0025710000007401', res.errcode);
					}
				})
			}else if(errcode == '1307' || errcode === '0000'){ //没有数据或者成功
				
				if(errcode === '0000' || res.data ){	
					self.consoleLog('接收到轮询消息：', res);
					var curMsg = res.data.data;
                    var messageId = res.data.msgId;
                    if(self.receivedMessage.indexOf(messageId) === -1){
                        self.onMessage(curMsg, function(okResponse){
                            self.consoleError('新版socket库不支持前端直接回复消息，请通过api接口进行消息回复');
                        }, function(failResponse){
                            self.consoleError('新版socket库不支持前端直接回复消息，请通过api接口进行消息回复');
                        });
                    }
					
					self.handlerMsg(messageId, function(){
						self.startPolling(false);
					});
										
				}else{
					self.startPolling(false);
				}
			}else{
				self.startPolling(false);
			}	
		}, function(x, e){						
			if(x.statusText !== 'abort'){
				self.consoleLog('轮询时发送网络或者服务器异常, 延时2秒后重新轮询');
				self.consoleLog(x, e);
				//发送网络或者
				setTimeout(function(){
					self.startPolling(false);
				}, 2000);
			}
			
		});		
	},
	retryConnect: function(errMsg, code){
		var self = this;	
		self.consoleLog(self.socketRetryTimes);
		if(self.socketRetryTimes >= self.socketRetryMaxTimes){	
			self.consoleLog('start polling');
			if(self.ws){
				self.ws.close();
			}
			
			self.socketRetryTimes = 0;
			if(!self.isPolling){
				this.pongTimeoutNum = 0;
				self.startPolling(true);
			}
		}else{
			this.pongTimeoutNum = 0;
			self.socketRetryTimes +=1;
			if(self.ws){
				self.ws.close();
				self.ws.open();
			}
			
		}
	},
	onPingTimeout: function(){
        var self = this;
        
		if(self.transports.indexOf('polling') !== -1){
            if(this.pongTimeoutNum < this.pongTimeoutMaxNum){			
                this.pongTimeoutNum +=1;
                self.consoleLog('ping TimeOut次数' + this.pongTimeoutNum);
            }else{
                
                
                if(self.ws){
                    self.ws.close();
                }
                
                self.socketRetryTimes = 0;
                if(!self.isPolling){
                    this.pongTimeoutNum = 0;
                    self.startPolling(true);
                }
            }
        }		
	},
	onListenMessage: function(res, fn){	
		var self = this;		
		if(typeof res.data === 'string'){
			res.data = JSON.parse(res.data);
		}
		
		if(res.errcode === '0000'){
			if(res.data.eventType === 'ping'){
				typeof fn ==='function' && fn(res);	
			}else{

				self.consoleLog('接收到socket消息：', res);
                
				if(self.receivedMessage.indexOf(res.data.msgId) == -1){
                    self.onMessage(res.data.data, function(resData){
                        var errcode = resData.errcode || '0000';
                        resData.errcode = errcode;
                        typeof fn ==='function' && fn(resData);
                        
                    }, function(errData){
                        typeof fn ==='function' && fn(errData);
                    })
                }

                if(res.data && res.data.msgId){					
					self.handlerMsg(res.data.msgId);
                }
			}					
		}else{
			typeof fn ==='function' && fn(res);
		}
	},
	init: function(name){
		var self = this;
		if(typeof name !== 'undefined' && name !== this.name){
			this.name = name;
        }
        
		this.ws = this.io(this.url, {
	        // 实际使用中可以在这里传递参数
	        path: this.path,
	        autoConnect: false,
	        query: {        
	          room: 'cloud',
	          userId: encodeURIComponent(this.name)
	        },
	        pingInterval: 30000,
			pingTimeout: 30000,
	        transports: this.socketIoTransports
	  	});
		
		this.ws.on('connect_failed', self.retryConnect.bind(self));		
		this.ws.on('connect_error', self.retryConnect.bind(self));	    
		this.ws.on('connect_timeout', self.retryConnect.bind(self));
		
		this.ws.on('connect', function(){

			self.consoleLog('socket连接成功: ' + self.name);
            
			//旧版监听自己的消息			
			self.ws.on(self.ws.id, self.onListenMessage.bind(self));			
			//新版监听自己的消息
			self.ws.on(self.name, self.onListenMessage.bind(self));

			self.socketConnected = true;			
			self.pongTimeoutNum = 0;

			self.onOpen(self.name, '0025710000007402');
			
			self.startPingPongCheck();

		});
		
		this.ws.on('error', function(err){	
			self.consoleLog('推送服务发送异常', err);
			self.onError('推送服务发送异常', '0025710000007401');
		})

		this.ws.on('disconnect', function(msg) {
			self.consoleLog('socket连接断开');
			self.socketConnected = false;			
			//self.onClose('断开连接', msg);
	  	});
	  	
	  	this.ws.open();
	},	
	sendPing: function(){
		var self = this;
		var defaultTimeout = self.defaultPingTimeout || 2000;
		var pingTime = +new Date();
		var pongTime = false;
		self.ws.emit('server', {				
			target: self.name,
			msg: JSON.stringify({eventType: 'ping', data: pingTime}),
		}, function(res) {
			
            if(document.hidden){
                self.consoleLog('页面当前不可见，忽略超时');
            }else{
                pongTime = +new Date();
                var runTime = pongTime - pingTime;
    
                if(res.errcode === '0000'){
                    if(runTime > defaultTimeout){
                        //启动轮询
                        self.consoleLog('ping 超时，耗时：' + runTime);						
                        self.onPingTimeout();					
                    }else{
                        self.pongTimeoutNum = 0; 
                        self.consoleLog('ping 正常，耗时：' + runTime + '， pingTime: ' + (pingTime/1000));
                    }
                    return false;
                }else{
                    //异常, 启动轮询
                    self.consoleLog('ping 异常：'+ res.description);
                    self.onPingTimeout();
                    return false;
                }
            }
            			
		});

        
        if(!document.hidden){
            //ping超时时间内无回复，
            setTimeout(function (){
                if(!pongTime ){
                    //启动轮询
                    self.consoleLog('ping 超时，500ms 内无回复，');                    
                    self.onPingTimeout();
                }
                return false;
            }, defaultTimeout>500?defaultTimeout:500);
        }else{
            self.consoleLog('页面当前不可见，忽略超时');
        }
		
	},
	startPingPongCheck: function(){
		//模拟ping pong发送消息，由于ping的时间由浏览器控制，兼容性不好
		var self = this;

		if(self.socketConnected){
			self.sendPing();
		}

		self.pingTick = setTimeout(function(){			
			self.startPingPongCheck();
		}, 5000);
	},
	stopPolling: function(){
		this.isPolling = false;
		if(this.pollingRequest){
			this.pollingRequest.abort();
		}
	},
	close: function(){
		this.stopPolling();
		window.clearTimeout(this.pingTick);
		this.ws.close();
	},
	sendNew: function(opt, retry, sendTime){
		sendTime = sendTime || (+new Date());
		var url = opt.url || '';
    	var self = this;
    	var to = opt.to || '';    	
    	var msg = opt.msg || '';
    	var success = opt.success || function(){};
		var error = opt.error || this.onError;
		var timeOut = opt.timeOut || 15;

    	retry = retry || 3;
    	if(to === ''){
    		error('请指定发送的目标用户名', '0025710000007407');
    		return false;
    	}
    	
    	if(msg === ''){
    		error('请指定需要发送的消息！', '0025710000007408');
    		return false;
		} 
		
		
    	if(this.ws){
			
			this.ws.emit('server', {
				sid: self.name + '-' +(+new Date()) + '-' + Math.random(),
				msgId: (+new Date()) + self.getShortUUId,
				async: false,
				from: self.name,
				target: to,
				msg: JSON.stringify(msg),
				timeOut: opt.timeOut || 20
			}, function(res) {

				if(res.errcode === '0000'){
					success(res);
				}else{
					var nowTime = +new Date();
					if(nowTime-sendTime > timeOut* 1000){
						const errMsg = res.description || '推送异常';
						error('请求超时, ' + errMsg);
					}else{
						if(res.errcode === 'connectErr'){
							setTimeout(function(){													
								self.sendNew(opt, retry - 1, sendTime);
							}, 1500);
						}else{
							const errMsg = res.description || '推送异常';
							error(errMsg);
						}
					}
				}
			});
		}else{
			error('未连接到推送服务', '0025710000007409');
		}
    	
    }
}

module.exports = PwyWebSocket;