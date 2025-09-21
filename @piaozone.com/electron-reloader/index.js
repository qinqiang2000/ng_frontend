'use strict';
const {inspect} = require('util');
const path = require('path');
const electron = require('electron');
const chokidar = require('chokidar');
const isDev = require('electron-is-dev');
const dateTime = require('date-time');
const chalk = require('chalk');
const findUp = require('find-up');
const { spawn } = require('child_process');
const os = require('os');

const execSpawn = function(cmdStr) {
	return new Promise((resolve, reject) => {
        let cmd = '';
        if (os.platform().indexOf('linux') !== -1) { // linux系统
            cmd = spawn('/bin/sh', ['-c', cmdStr], {stdio: 'inherit'});
        } else {
            // cmd = spawn('cmd', ['/s', '/c', cmdStr], {stdio: 'inherit'});
            cmd = spawn('cmd', ['/q', '/s', '/c', cmdStr], {stdio: 'pipe'}); // 不弹出cmd提示框
        }

		cmd.on('exit', function(code){
			if (code === 0) {
				resolve(code);
			} else{
				reject(code);
			}
		});
	})
}

function getMainProcessPaths(topModuleObject, cwd) {
	const paths = new Set([topModuleObject.filename]);

	const getPaths = moduleObject => {
		for (const child of moduleObject.children) {
			if (paths.has(child.filename)) {
				continue;
			}

			if (path.relative(cwd, child.filename).includes('node_modules')) {
				continue;
			}

			paths.add(child.filename);
			getPaths(child);
		}
	};

	getPaths(topModuleObject);

	return paths;
}

module.exports = (options = {}) => {
	// This module should be a dev dependency, but guard
    // this in case the user included it as a dependency.
	if (!isDev) {
		return;
	}

	options = {
		watchRenderer: true,
		...options
    };
    const buildConfig = require(options.buildConfig);
	const mainProcessDirectory = buildConfig.rootDir;
	const packageDirectory = findUp.sync('package.json', {cwd: buildConfig.rootDir});
	const cwd = packageDirectory ? path.dirname(packageDirectory) : mainProcessDirectory;
    // const mainProcessPaths = getMainProcessPaths(buildConfig.srcDir, cwd);
    const mainProcessPaths = [];
	const watchPaths = options.watchRenderer ? cwd : [...mainProcessPaths];
	let isRelaunching = false;

	const watcher = chokidar.watch(watchPaths, {
		cwd,
		disableGlobbing: true,
		ignored: [
			/(^|[/\\])\../, // Dotfiles
			'node_modules',
			'**/*.map'
		].concat(options.ignore)
	});

	electron.app.on('quit', () => {
		watcher.close();
	});

	if (options.debug) {
		watcher.on('ready', () => {
			console.log('Watched paths:', inspect(watcher.getWatched(), {compact: false, colors: true}));
		});
	}

	watcher.on('change', cgFilePath => {
        const projectDir = path.join(cwd);
        const tsConfig = require(path.join(projectDir, 'tsconfig.json'));
        const outDir = tsConfig.compilerOptions.outDir.replace(/\/$/, '');
        const filePath = cgFilePath.replace(/^client(.*)$/, outDir + '/$1').replace(/^(.*)\.ts$/, '$1.js');

        const handerChange = function() {
            if (options.debug) {
                console.log('File changed:', chalk.bold(filePath), chalk.dim(`(${dateTime().split(' ')[1]})`));
            }
            if (cgFilePath !== 'client\\preload.ts') {
                // Prevent multiple instances of Electron from being started due to the change
                // handler being called multiple times before the original instance exits.
                if (!isRelaunching) {
                    electron.app.relaunch();
                    electron.app.exit(0);
                }

                isRelaunching = true;
            } else {
                for (const window_ of electron.BrowserWindow.getAllWindows()) {
                    window_.webContents.reloadIgnoringCache();

                    for (const view_ of window_.getBrowserViews()) {
                        view_.webContents.reloadIgnoringCache();
                    }
                }
            }
        }
        if (/^client.*$/.test(cgFilePath)) {
            const cmd = `pwy-webpack5 --build --type=node-ts --config=${options.buildConfig} --devtool=source-map --pwy-env=local --node-env=development`;
            execSpawn(cmd).then(handerChange);
        } else {
            // handerChange();
        }
	});
};
