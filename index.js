#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const camelcase = require('lodash.camelcase');
const commands = require('commands');
const OutputPatcher = require('./src/patches').OutputPatcher;
const rootDirectory = process.cwd();

const handleSetup = commands.handleSetup();
const VERSION = require('./src/config').VERSION;

const unknownCommand = program => !program.args.map(arg => typeof arg).includes('object')

program.version(VERSION)
  .usage('add-reason [command] [options]')
  .option('--no-linking', 'don\'t create the symlink to your compiled ReasonML code');

program.command('setup <directory> [package-name]')
  .description('set up Reason directory, config files, and symlink')
  .action((directory, name) => {
    // given name or last source directory path name or simply `pkg`
    name = name || directory.replace(/\/+$/, '').split('/').pop() || 'pkg';
    handleSetup(name, directory, rootDirectory, VERSION, program.linking);
  });

 program.command('link <package-name>')
  .description('create a symlink with the given package name')
  .action((name, directory) => {});

 program.command('rename <package-name>')
  .description('change the current Reason package name symlink')
  .action((alias) => {});

program.command('unlink <package-name>')
  .description('removes the given symlink')
  .action((name) => {});

OutputPatcher(program);

program.parse(process.argv);

// Set default command to --help
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

if (unknownCommand(program)) {
  const directory = program.args[0];
  const name = program.args[1] || directory.replace(/\/+$/, '').split('/').pop() || 'pkg';
  handleSetup(name, directory, rootDirectory, VERSION, program.linking);
  process.exit(0);
}
