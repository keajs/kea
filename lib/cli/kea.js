#! /usr/bin/env node


'use strict';

var program = require('commander');
var packageJson = require('../../package.json');

program.version(packageJson.version).usage('<command>');

program.command('new <project_name>', 'create a new project').alias('n');

program.command('generate <scene[/component[/filetype]]>', 'generate code').alias('g');

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}