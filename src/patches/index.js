'use strict';

const fs = require('fs');
const jsonfile = require('jsonfile');
const jsonFormat = require('json-format');

/**
 * Takes a commander instance and patches help output to remove and adjust
 * some of the weird spacing.
 * @param {Commander} commander The commander instance.
 * @return {void} Returns nothing since the commander object is just mutated synchronously.
 */
const OutputPatcher = (commander) => {
  const originalHelpOutput = commander.helpInformation();
  const newNativeHelpMethod = function() {
    let newOutput = originalHelpOutput.replace(/\n  Commands/gmi, '  Commands');
    return newOutput;
  }
  commander.helpInformation = newNativeHelpMethod;
};

/**
 * Takes a path to a `package.json` file and adds the given command to its `scripts` key.
 * Note that everything needs to be sync because of the ordering of the output.
 * @param {string} file The absolute path to the `package.json` file.
 * @param {string} command The command to add to the `scripts` key.
 * @return {void} The success of the operations.
 */
const editPackageScripts = (file, command) => {
  const config = {
    type: 'space',
    size: 2
  };
  try {
    const contents = jsonfile.readFileSync(file);
    // No existing scripts
    if (!contents.scripts) {
      contents.scripts = {
        postinstall: command
      };
    }
    // Already are some scripts
    else {
      // Already is a postinstall script
      if (contents.scripts.postinstall) {
        // Make sure we don't add this command more than once if it already exists
        if (contents.scripts.postinstall.indexOf(command) > -1) return true;
        command = `${contents.scripts.postinstall} && ${command}`;
      }
      contents.scripts.postinstall = command;
    }
    fs.writeFileSync(file, jsonFormat(contents, config));
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Builds a basic `bsconfig.json` file given the source directory.
 * @param {string} source Path to source directory. Generally a relative one.
 * @param {string} packageLocation Path to `package.json` file. Used to get the project name.
 * @return {string} The contents to the `bsconfig.json` file.
 */
const generateConfigContents = (source, packageLocation) => {
  const pkg = jsonfile.readFileSync(packageLocation);
  const name = pkg.name;
  return `// Generated by the add-reason init command -- This is just a basic template, feel free to edit!
{
  "name": "${name}",
  "version": "0.1.0",
  "sources": [
    "${source}"
  ],
  "bs-dependencies" : [],
  "refmt": 3,
  "namespace": true
}
`;
};

/**
 * Builds a basic `.merlin` file given the source directory.
 * @param {string} source Relative path to source directory. Has no leading or trailing slashes.
 * @param {string} nodeModulesDirectory Absolute path to root directory. Has leading slash, no trailing slash.
 * @return {string} The contents to the `.merlin` file.
 */
const generateMerlinContents = (source, nodeModulesDirectory) => {
  // `process.execPath` will give us the absolute path to the users node executable file, which
  // is located in the `bin` directory. We remove the last two parts of the path to get to the
  // root. We end up removing `node` (the executable) and `bin` when we do this, leaving us in
  // the root.
  const nodeExecRoot = process.execPath.split('/').slice(0, -2).join('/');
  return `### Generated by the add-reason init comand -- You can edit this if you want!
### New to merlin? Learn more about it here: https://github.com/ocaml/merlin/wiki/Project-configuration
S ${source}
S ${nodeModulesDirectory}/bs-platform/lib/ocaml
B ${nodeModulesDirectory}/bs-platform/lib/ocaml
B lib/bs
B lib/bs/${source}
FLG -ppx ${nodeExecRoot}/lib/node_modules/bs-platform/lib/bsppx.exe
FLG -nostdlib -no-alias-deps -color always
FLG -w -30-40+6+7+27+32..39+44+45+101-26-27
`;
};

const flush = () => {
  if (process.stdout.clearLine && process.stdout.cursorTo) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  } else {
    const readline = require('readline');
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
  }
};

module.exports.OutputPatcher = OutputPatcher;
module.exports.editPackageScripts = editPackageScripts;
module.exports.generateConfigContents = generateConfigContents;
module.exports.generateMerlinContents = generateMerlinContents;
module.exports.flush = flush;
