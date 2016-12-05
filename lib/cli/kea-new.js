#! /usr/bin/env node


'use strict';

var program = require('commander');
var packageJson = require('../../package.json');
var fs = require('fs');

program.version(packageJson.version).usage('<project_name>').option('-t, --template <name>', 'A template to use when creating the project').parse(process.argv);

if (!program.args.length) {
  program.help();
}

var templates = require('../../assets/templates.json');

var projectName = program.args[0];

if (!projectName.match(/^[a-z][a-z0-9_\-]+$/)) {
  console.error('The project must start with a letter and can only contain these symbols: a-z, 0-9, -, _');
  process.exit();
}

var template = program.template || 'default';
var repo = template.indexOf('/') > 0 ? program.template : templates[template];

if (!repo) {
  console.error('Could not find repository for template "' + template + '"');
  process.exit();
}

try {
  fs.statSync('./' + projectName);
  console.error('File or folder "./' + projectName + '" already exists');
  process.exit();
} catch (e) {
  // error if file doesn't exist
}

var fullRepo = 'https://github.com/' + repo;

console.log('Creating new project "' + projectName + '" with template "' + template + '" (' + repo + ')');

var execSync = require('child_process').execSync;
var cmd = 'git clone --quiet --depth=1 --branch=master ' + fullRepo + ' ./' + projectName + ' && rm -rf ./' + projectName + '/.git';

console.log('--> Running: ' + cmd);

execSync(cmd);

var projectPackage = './' + projectName + '/package.json';

fs.readFile(projectPackage, 'utf8', function (err, data) {
  if (err) {
    console.log('--> Clone failed');
    return console.log(err);
  }
  console.log('--> Clone succeeded');
  console.log('--> Updating package.json');

  var json = JSON.parse(data);
  json.name = projectName;
  json.author = 'Write your name here';
  json.version = '0.0.1';

  fs.writeFile(projectPackage, JSON.stringify(json, null, 2), function () {
    console.log('');
    console.log('All set! Next steps:');
    console.log('  cd ' + projectName);
    console.log('  One of:');
    console.log('    npm install');
    console.log('    yarn');
    console.log('  npm start');
  });
});