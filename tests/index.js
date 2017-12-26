'use strict';

const path = require('path');
const initializer = require('initializer');
const chalk = require('chalk');
const handleInit = initializer.handleInit();
const rootDirectory = path.join(__dirname, 'mockRoot');
const version = require('../src/config').VERSION;

const name = 'reason-package';
const directory = 'src/myCode';
console.log(`$> ${chalk.green('add-reason')} init ${name} ${directory}`)
handleInit(name, directory, rootDirectory, version, true);
// require('./mockRoot/index');
