#!/usr/bin/env node
const path = require('path');
const configBasedir = path.resolve(__dirname, '../');
const eslintrc = path.resolve(configBasedir, 'config/eslintRules.js');
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


// to use V8's code cache to speed up instantiation time
require('v8-compile-cache');

// must do this initialization *before* other requires in order to work
if (process.argv.includes('--debug')) {
    require('debug').enable('eslint:*,-eslint:code-path,eslintrc:*');
}


function readStdin() {
    return new Promise((resolve, reject) => {
        let content = '';
        let chunk = '';

        process.stdin
            .setEncoding('utf8')
            .on('readable', () => {
                while ((chunk = process.stdin.read()) !== null) {
                    content += chunk;
                }
            })
            .on('end', () => resolve(content))
            .on('error', reject);
    });
}

/**
 * Get the error message of a given value.
 * @param {any} error The value to get.
 * @returns {string} The error message.
 */
function getErrorMessage(error) {

    // Lazy loading because this is used only if an error happened.
    const util = require('util');

    // Foolproof -- thirdparty module might throw non-object.
    if (typeof error !== 'object' || error === null) {
        return String(error);
    }

    // Use templates if `error.messageTemplate` is present.
    if (typeof error.messageTemplate === 'string') {
        try {
            const template = require(`../messages/${error.messageTemplate}.js`);

            return template(error.messageData || {});
        } catch {

            // Ignore template error then fallback to use `error.stack`.
        }
    }

    // Use the stacktrace if it's an error object.
    if (typeof error.stack === 'string') {
        return error.stack;
    }

    // Otherwise, dump the object.
    return util.format('%o', error);
}

// process.exitCode = eslintCli.execute(process.argv.concat(eslintArgv));


function onFatalError(error) {
    process.exitCode = 2;

    const { version } = require('../package.json');
    const message = getErrorMessage(error);

    console.error(`
Oops! Something went wrong! :(

ESLint: ${version}

${message}`);
}

(async function main() {
    process.on('uncaughtException', onFatalError);
    process.on('unhandledRejection', onFatalError);
    // Otherwise, call the CLI.
    process.exitCode = await require(path.resolve(__dirname, '../node_modules/eslint/lib/cli')).execute(
        process.argv.concat(eslintArgv),
        process.argv.includes('--stdin') ? await readStdin() : null
    );
}()).catch(onFatalError);

