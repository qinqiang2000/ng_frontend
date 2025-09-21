#!/usr/bin/env node

const path = require('path');

const argv = [];
const configBasedir = path.resolve(__dirname, '../');
const babelConfig = path.resolve(configBasedir, 'config/babel.config.js');
argv.push('--config-file=' + babelConfig);
process.argv = process.argv.concat(argv);
require('@babel/cli/lib/babel');