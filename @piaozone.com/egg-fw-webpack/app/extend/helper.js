
const defaultTimeout = [5000, 90000];
const fs = require('fs');
const path = require('path');

module.exports = {
    getServerIp() {
        const interfaces = os.networkInterfaces();
        for (let devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return 'localhost';
    },
    async replaceClientHtml(tpl, name, opt) {
        const {
            staticUrl
        } = this.ctx.app.config;
        opt = {
            ...opt,
            staticUrl
        };
        return tpl.replace('<!-- __SCRIPT_INITIAL_STATE__ -->',
            `<script type="text/javascript">window.__INITIAL_STATE__ = ${JSON.stringify(opt)}</script>`
        ).replace(/href="(.*?\.css)/g, `href="${staticUrl}$1`).replace(/src="(.*?\.js)/g, `src="${staticUrl}$1`);
    },
    async getBundleContent(filePath) {
        let res;
        if (this.app.config.env === 'local') {
            res = await this.app.webpack.fileSystem.readWebpackMemoryFile(filePath);
        } else {
            res = fs.readFileSync(filePath, 'utf-8');
        }
        return res;
    },
    async render(name, opt) {
        const {
            ctx,
            app
        } = this;
        const filePath = path.join(app.baseDir, `dist/${name}.html`);
        let content = '';
        try {
            //const manifestPath = path.join(app.baseDir, `dist/manifest.json`);
            // let manifest = await fs.readFileSync(manifestPath, 'utf-8');
            // manifest = JSON.parse(manifest);
            // name = path.basename(manifest[name + '.js']);

            const appFilePath = path.join(app.baseDir, `dist/${name}.js`);
            content = await this.getBundleContent(filePath);
            const appJs = await this.getBundleContent(appFilePath);

            const wrapper = NativeModule.wrap(appJs);

            module.id = appFilePath;
            module.filename = appFilePath;

            vm.runInThisContext(wrapper)(exports, require, module, appFilePath, path.dirname(appFilePath));
            const App = module.exports && module.exports.default ? module.exports : exports.default ? exports : module.exports;
            const instance = React.createElement(App, opt);
            const renderContent = content.replace('<!-- HTML_DATA_PLACHOLDER -->', renderToString(instance)).replace(/<script .*<\/script>/g, '')
                .replace('<!-- __SCRIPT_INITIAL_STATE__ -->', '')
                .replace('<!-- HTML_SCRIPT_PLACHOLDER -->', '');
            ctx.body = renderContent;
            ctx.status = 200;
        } catch (err) {
            ctx.logger.error(err);
            content = await this.replaceClientHtml(content, name, opt);
            ctx.body = content;
            ctx.status = 200;
        }
    },
    async renderClient(name, opt) {
        const {
            ctx,
            app
        } = this;
        const filePath = path.join(app.baseDir, `dist/${name}.html`);
        let content = await this.getBundleContent(filePath);
        content = await this.replaceClientHtml(content, name, opt);
        ctx.body = content;
        ctx.status = 200;
    },
    writeFileSync(filePath, content) {
        try {
            const fd = fs.openSync(filePath, 'w');
            fs.writeFileSync(fd, content);
            fs.closeSync(fd);
        } catch (error) {
            this.ctx.logger.error(error);
            return false;
        }
        return true;
    },
    getAsset(name) {
        const ctx = this.ctx;
        const debug = ctx.request.query.debug;
        const env = ctx.app.config.env;
        const webpackPublicPath = ctx.app.config.staticUrl + ctx.app.config.__webpack_public_path__;
        if (env === 'local') {
            return '';
        } else if (env !== 'prod' && !!debug) {
            const manifestJson = require(path.join(ctx.app.baseDir, 'config/manifest-debug.json'));
            if (manifestJson[name]) {
                return webpackPublicPath + '/debug/' + manifestJson[name];
            } else {
                return '';
            }
        } else {
            const manifestJson = require(path.join(ctx.app.baseDir, 'config/manifest.json'));
            if (manifestJson[name]) {
                return webpackPublicPath + '/' + manifestJson[name];
            } else {
                return '';
            }
        }
    },
    loggerInfo(title, url, data, res) {
        const ctx = this.ctx;
        ctx.runInBackground(async() => {
            ctx.logger.info(title + ', 地址', url);
            ctx.logger.info(title + ', 参数', JSON.stringify(data).substr(0, 500));
            ctx.logger.info(title + ', 返回', JSON.stringify(res).substr(0, 500));
        });
    },
    deleteFiles(dirPath, maxLiveTime = 0, needRemoveRootDir = false) {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            let deleteDirFlag = true;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const curPath = path.join(dirPath, file);
                const stat = fs.statSync(curPath);
                if (stat.isDirectory()) {
                    this.deleteFiles(curPath, maxLiveTime, true);
                } else if (stat.isFile()) {
                    if (maxLiveTime === 0) { // 存活时间不判断，直接清空
                        fs.unlinkSync(curPath);
                    } else {
                        const createTime = parseInt(stat.ctimeMs);
                        const nowTime = +new Date();
                        if (nowTime - createTime > maxLiveTime) {
                            fs.unlinkSync(curPath);
                        } else {
                            deleteDirFlag = false; // 有一个文件没有删除，则不删除父目录
                        }
                    }
                } else {
                    deleteDirFlag = false; // 有其它文件格式存在，不删除父目录（块设备， 字符设备，软链接等）
                }
            }

            if (needRemoveRootDir && deleteDirFlag) {
                try {
                    fs.rmdirSync(dirPath);
                } catch (e) {
                    this.ctx.logger.error(e);
                }
            }
            return true;
        }
    },
	async curl(url, opt) {
		const ctx = this.ctx;
		const {data, method='POST', contentType = 'json', dataType='text', headers={}, timeout=defaultTimeout} = opt;

		const result =  await ctx.curl(url, {
			method,
	  		data,
	  		contentType,
	  		dataType,
	  		timeout,
	  		headers
		});

		if(result.data){
            let res;
			try {
                res = JSON.parse(result.data);
            } catch (error) {
                console.log('解析json报错, 返回值', result.data);
                console.log('error: ', error);
                return {errcode: '5000', description:  '服务端异常，请稍后重试！'};
            }

			const {errcode='', description=''} = res;

			if(errcode === '0000'){
	  			return res;
	  		}else if(errcode === ''){
	  			if(ctx.app.config.env !== 'prod'){
	  				console.log(result);
	  			}
	  			return {errcode: 'err', description:  res.error + '('+ res.status +')'};
	  		}else{
	  			return {errcode, description};
	  		}
		}else{
			if(ctx.app.config.env !== 'prod'){
				console.log(result);
			}
			return {errcode: 'err', description:  res.error + '('+ res.status +')'};
		}
	},
	async authCurl(url, opt) {
		const ctx = this.ctx;
		if(!ctx.session.access_token){
			return {errcode: '1300', description: '用户登录信息失效，请重新登录'};
		}else{
			//如果用户登录信息未失效，则延长
			ctx.session.belongOrgId = ctx.session.belongOrgId;
			ctx.session.currentOrgId = ctx.session.currentOrgId;
			ctx.session.access_token = ctx.session.access_token;
		}

		const urls = url.split('?');
		url = urls[0] + '?access_token=' + ctx.session.access_token;
		if(urls.length >1){
			url +='&' + urls[1];
		}


		const belongOrgId = ctx.session.belongOrgId || 0;
		const currentOrgId = ctx.session.currentOrgId || 0;

		const headers = {};
		const {data={}, method='POST', contentType = 'json', dataType='text', timeout=defaultTimeout} = opt;

		if(method === 'POST'){
			ctx.set('belongOrgId', belongOrgId);
			ctx.set('currentOrgId', currentOrgId);
			headers.belongOrgId = belongOrgId;
			headers.currentOrgId = currentOrgId;
			data.currentOrgId = currentOrgId;
		}else if(method === 'GET'){
			url += '&belongOrgId=' + belongOrgId + '&currentOrgId=' + currentOrgId;
		}

		if(ctx.app.config.env !== 'prod'){
			console.log(url);
			console.log(data);
		}

		return await this.curl(url, {data, method, contentType, dataType, headers, timeout});
	}
}

