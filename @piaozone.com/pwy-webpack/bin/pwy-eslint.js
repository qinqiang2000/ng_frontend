#!/usr/bin/env node

const eslintCli = require("eslint/lib/cli");
const path = require('path');
const configBasedir = path.resolve(__dirname, '../');
const eslintrc = path.resolve(configBasedir, 'config/.eslintrc.js');
const eslintignore = path.resolve(configBasedir, 'config/.eslintignore');

const argvStr = process.argv.join(', ');

const eslintArgv = [];    
if (argvStr.indexOf('--ext=') === -1) {
    eslintArgv.push('--ext=.js,jsx,ts')
}

if(argvStr.indexOf('--config=') === -1) {
    eslintArgv.push('--config=' + eslintrc);
}

if(argvStr.indexOf('--ignore-path' === -1)) {
    eslintArgv.push('--ignore-path=' + eslintignore);
}

if(argvStr.indexOf('--resolve-plugins-relative-to' === -1)) {
    eslintArgv.push('--resolve-plugins-relative-to=' + path.resolve(__dirname, '../node_modules'));
}

process.exitCode = eslintCli.execute(process.argv.concat(eslintArgv));
    
