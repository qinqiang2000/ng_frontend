#!/usr/bin/env node

const path = require('path');
const configBasedir = path.resolve(__dirname, '../');
const argv = [];

process.argv.slice(2).forEach((item) => {
    if (item.indexOf('--config=') === -1) {
        argv.push(item);
    }
})

const configPath = path.resolve(configBasedir, 'config/jest/jest.config.js');
argv.push('--config=' + configPath);
argv.push('--coverage');

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'test';
}

require('jest-cli/build/cli').run(argv);