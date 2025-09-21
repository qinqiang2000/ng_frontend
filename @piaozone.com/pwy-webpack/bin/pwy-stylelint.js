#!/usr/bin/env node

const path = require('path');
const configBasedir = path.resolve(__dirname, '../');
const stylelintrc = path.resolve(configBasedir, 'config/.stylelintrc.js');
const stylelintignore = path.resolve(configBasedir, 'config/.stylelintignore');

const argvStr = process.argv.join(', ');
require('v8-compile-cache');
let stylelintArgs = process.argv.splice(2);        
if(argvStr.indexOf('--config=') === -1) {
stylelintArgs.push('--config=' + stylelintrc);
}
if(argvStr.indexOf('--ignore-path') === -1) {
stylelintArgs.push('--ignore-path=' + stylelintignore);
}
require('stylelint/lib/cli')(stylelintArgs);

    
