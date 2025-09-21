#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const { copyFolder, execSpawns, execSpawn, readFileSync } = require('../lib/tools');
const { exec } = require('child_process');

program.option('--t, --type [type]', 'build type or project type')
    .option('-c, --config [type]', 'project config file')
    .option('--init', 'init project')
    .option('--fix-eslint', 'eslint fix')
    .option('--progress', 'show progress')
    .option('--build', 'build src')
    .option('--dev', 'dev server')
    .option('-i, --install', 'auto install packages')
    .option('--disable-eslint', 'disable eslint')
    .option('--disable-stylelint', 'disable stylelint')
    .option('--project-name [type]', 'project name')
    .option('--project-description [type]', 'project description')
    .option('--author [type]', 'author name')
    .option('--production', 'install mode')
    .option('--registry [type]', 'npm registry')
    .option('--only [type]', 'npm install from like piaozone')
	.option('--lock [type]', 'npm install local package version')
    .option('--devtool [type]', 'webapck devtool')
    .option('--test', 'start test')
    .option('--node-env [type]', 'control webpack NODE_ENV')
	.option('--pwy-env [type]', 'control pwy env')
    .option('--watch', 'watch')
    .parse(process.argv);

const argv = program.opts();

const copyAndTpls = function (srcDir, targetDir, options) {
    return new Promise((resolve) => {
        copyFolder({
            filter: (curPath) => {
                return curPath.indexOf('.svn') === -1;
            },
            srcDir,
            tarDir: targetDir,
            handleFile: (content, srcPath) => {
                if (path.basename(srcPath) === 'package.json') {
                    return content.replace(/\{\{(.+?)\}\}/g, function (node, key) {
                        return options[key] || '';
                    });
                }  else {
                    return content;
                }
            },
            cb: function(err) {
                resolve(err);
            }
        })
    })

}

// 初始化项目
if(argv.init){
    let projectRootDir = path.resolve('./');
    let projectName = path.basename(projectRootDir);
    if (argv.projectName) {
        projectName = argv.projectName;
        projectRootDir = path.join(projectRootDir, argv.projectName);
        if(!fs.existsSync(projectRootDir)) {
            fs.mkdirSync(projectRootDir);
        }
        process.chdir(projectRootDir);
    }

    fs.readdir(projectRootDir, async (err, curDirFiles) => {
        if(err) {
            console.error(err);
            return;
        }

        if (curDirFiles.length !== 0) {
            console.error('project dir is not emptry');
            return;
        }

        const allowTypes = ['react-antd-typescript', 'react-antd-electron-typescript', 'react-antd-mobile-typescript', 'react-antd-electron-webpack-ts'];
        if (allowTypes.indexOf(argv.type) === -1) {
            console.error('project type must is ' + allowTypes.join(', '));
            return;
        }

        console.log('init project files...', argv.type);

        const srcDir = path.resolve(__dirname, '../tpl/' + argv.type);
        const distDir = path.resolve('./');
        const optionData = {
            projectName,
            author: argv.author || '',
            projectDescription: argv.projectDescription || ''
        };

        let result = await copyAndTpls(srcDir, distDir, optionData);
        if(result) {
            console.error('init project files err', result);
        }

        console.log('init project files success');
        if(argv['install']) {
            console.log('npm install packages...');
            let cmdStr = 'pwy-webpack -i';
            if (argv.type === 'react-antd-electron-typescript') {
                cmdStr = 'npm i --prefix=./electron-web && npm i --prefix=./electron-client';
            }
            const resCode = await execSpawn(cmdStr);
            if (resCode !== 0) {
                console.log('npm install fail');
                process.exit(resCode);
            }
        }
    });
}else if (argv.config) {
    const configFile = path.resolve('./', argv.config);
    const buildConfig = require(configFile);

    if (typeof argv.disableEslint !== 'undefined') {
        buildConfig.disableEslint = argv.disableEslint;
    }
    if (typeof argv.disableStylelint !== 'undefined') {
        buildConfig.disableStylelint = argv.disableStylelint;
    }

    if (argv.build) {
        const type = argv.type || '';
        console.log('webpack is building...');
        const webpackBuild = require('../lib/build');
        let webpackConfig;
        if(type === '') {
            const getWebpackConfig = require('../config/webpack.prod');
            webpackConfig = getWebpackConfig(buildConfig, argv);
        } else if (type === 'ssr') {
            const getWebpackConfig = require('../config/webpack.ssr');
            webpackConfig = getWebpackConfig(buildConfig, argv);
        } else if(type === 'lib') { // 把自己的代码转换为lib文件
            const getWebpackConfig = require('../config/webpack.lib');
            webpackConfig = getWebpackConfig(buildConfig, argv);
        } else if(type === 'node') { // 把自己的代码转换为lib文件
            const getWebpackConfig = require('../config/webpack-node.lib');
            webpackConfig = getWebpackConfig(buildConfig, argv);
        } else if(type === 'node-ts') { // 把自己的代码转换为lib文件
            const getWebpackConfig = require('../config/webpack-node.ts');
            webpackConfig = getWebpackConfig(buildConfig, argv);
        }  else if(type === 'dll') { // 生成dll文件, 多用于第三方库文件合并
            const getWebpackConfig = require('../config/webpack.dll');
            const { entry, dist, includeDirs, nodeModulesDir } = buildConfig;
            webpackConfig = getWebpackConfig({
                entry,
                dist,
                rootDir,
                includeDirs,
                nodeModulesDir
            }, argv);
        } else {
            console.error('not supper the build type: ' + type);
            return;
        }

        try {
            webpackBuild(webpackConfig, argv, buildConfig);
        } catch (error) {
            console.log('---------', error);
        }

    } else if(argv.dev) {
        console.log('webpack dev server is running...');
        const webpackDev = require('../lib/dev');
        const getWebpackConfig = require('../config/webpack.dev');
        const webpackConfig = getWebpackConfig(buildConfig);
        webpackDev(webpackConfig, argv, buildConfig);
    } else if (argv.test) {
        const startTestProject = require('../lib/test');
        startTestProject(argv, buildConfig);
    }
} else if (argv.install) {
    const isProduction = argv.production;
    if(!fs.existsSync('./package.json')) {
        console.log('not found package.json');
        return;
    }
    const packageStr = readFileSync('./package.json');
	const info = JSON.parse(packageStr);

	const dependencies = info.dependencies || {};
	const devDependencies = info.devDependencies || {};
	const depKeys = Object.keys(dependencies);
	const devDepKeys = Object.keys(devDependencies);
	const dependenciesArr = [];
	const devDependenciesArr = [];
	let fpyPackages = [];
    const fpyDevPackages = [];
    const installOnly = argv.only;
	const installLock = argv.lock;
    const onlyReg = new RegExp('^.*' + installOnly + '.*$');
	for (let i=0; i<depKeys.length; i++) {
        const k = depKeys[i];
        if (/^@piaozone.com\/.*/.test(k)) {
            if (installOnly) {
                if (onlyReg.test(k)) {
                    fpyPackages.push(k + '@' + dependencies[k].replace(/^\^/, ''));
                }
            } else {
                fpyPackages.push(k + '@' + dependencies[k].replace(/^\^/, ''));
            }

        } else {
            if (installOnly) {
                if (onlyReg.test(k)) {
                    dependenciesArr.push(k + '@' + dependencies[k].replace(/^\^/, ''));
                }
            } else {
                dependenciesArr.push(k + '@' + dependencies[k].replace(/^\^/, ''));
            }

        }

	}

	for (let i=0; i<devDepKeys.length; i++) {
		const k = devDepKeys[i];
		if (/^@piaozone.com\/.*/.test(k)) {
            if (installOnly) {
                if (onlyReg.test(k)) {
                    fpyDevPackages.push(k + '@' + devDependencies[k].replace(/^\^/, ''));
                }
            } else {
                fpyDevPackages.push(k + '@' + devDependencies[k].replace(/^\^/, ''));
            }
		} else {
            if (installOnly) {
                if (onlyReg.test(k)) {
                    devDependenciesArr.push(k + '@' + devDependencies[k].replace(/^\^/, ''));
                }
            } else {
                devDependenciesArr.push(k + '@' + devDependencies[k].replace(/^\^/, ''));
            }
		}
	}

    const cmds = [];
    if (installOnly || installLock) {
        let cmdMiddleStr = '';
        let cmdDevMiddleStr = '';
        let cmdFpyMiddleStr = '';
        let cmdDevFpyMiddleStr = '';
        cmdMiddleStr += dependenciesArr.join(' ');
        cmdFpyMiddleStr += fpyPackages.join(' ');
        if (!isProduction) {
            cmdDevMiddleStr += devDependenciesArr.join(' ');
            cmdDevFpyMiddleStr += fpyDevPackages.join(' ');
        }


        let cmdStr = '';
        let cmdFpyStr = '';
        let cmdDevStr = '';
        let cmdDevFpyStr = '';
        if (cmdMiddleStr !== '') {
            cmdStr = 'npm install ' + cmdMiddleStr  + ' --registry=https://registry.npmmirror.com --save';
            if (isProduction) {
                cmdStr += ' --production';
            }
            cmds.push(cmdStr);
        }

        if (cmdFpyMiddleStr !== '') {
            const registry = argv.registry || 'http://172.18.1.117:7001';
            cmdFpyStr = 'npm install ' + cmdFpyMiddleStr  + ' --registry=' + registry + ' --save';
            if (isProduction) {
                cmdFpyStr += ' --production';
            }
            cmds.push(cmdFpyStr);
        }

        if (!isProduction) {
            if (cmdDevMiddleStr !== '') {
                cmdDevStr = 'npm install ' + cmdDevMiddleStr  + ' --registry=https://registry.npmmirror.com --save-dev';
                cmds.push(cmdDevStr);
            }

            if (cmdDevFpyMiddleStr !== '') {
                const registry = argv.registry || 'http://172.18.1.117:7001';
                cmdDevFpyStr = 'npm install ' + cmdDevFpyMiddleStr  + ' --registry=' + registry + ' --save-dev';
                cmds.push(cmdDevFpyStr);
            }
        }
    } else {
        if (fpyPackages.length > 0 || fpyDevPackages.length >0 ) {
            cmds.push('npm install --registry=http://172.18.1.117:7001');
        } else {
            cmds.push('npm install --registry=https://registry.npmmirror.com');
        }
    }


	execSpawns(cmds, 0, (code) => {
		if (code === 0) {
			console.log('npm install success');
		} else {
            console.log('npm install fail');
            process.exit(code);
        }
	});
}
