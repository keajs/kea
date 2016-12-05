#! /usr/bin/env node


'use strict';

var program = require('commander');
var packageJson = require('../../package.json');
var changeCase = require('change-case');
var fs = require('fs');

program.version(packageJson.version).description('Usage examples:\n\n    kea g scene-name                               # new scene\n    kea g scene-name/component-name                # component under the scene\n    kea g scene-name/component-name/really-nested  # deeply nested logic').usage('<name>').parse(process.argv);

if (!program.args.length) {
  program.help();
}

var name = program.args[0];

if (!name || !name.match(/^[a-z][a-z0-9\-\/]+$/)) {
  console.error('Error: name must be lowercase alphanumeric with optional dashes');
  process.exit();
}

var appFolder = 'app';

// check if the scenes folder exists
try {
  fs.statSync('./' + appFolder + '/scenes');
} catch (e) {
  try {
    appFolder = 'src';
    fs.statSync('./' + appFolder + '/scenes');
  } catch (e) {
    console.error('Can\'t find the ./app/scenes or ./src/scenes folder! Are you in a kea project?');
    process.exit();
  }
}

var nameParts = name.split('/');
var scene = nameParts[0];
var sceneFolder = './' + appFolder + '/scenes/' + scene;
var fullFolder = './' + appFolder + '/scenes/' + name;

var scaffoldFolder = __dirname + '/../../assets/scaffolds/' + (nameParts.length === 1 ? 'scene' : 'code');
var folderToGenerate = nameParts.length === 1 ? sceneFolder : fullFolder;

// check if the folder exists
try {
  fs.statSync(folderToGenerate);
  console.error('File or folder "' + folderToGenerate + '" already exists');
  process.exit();
} catch (e) {}

var files = fs.readdirSync(scaffoldFolder);

if (files.length < 0) {
  console.error('Something is wrong with the scaffold folder!');
  process.exit();
}

fs.mkdirSync(folderToGenerate);
files.filter(function (f) {
  return f != '_notice.txt';
}).forEach(function (fileName) {
  var contents = fs.readFileSync(scaffoldFolder + '/' + fileName, 'utf8');
  fs.writeFileSync(folderToGenerate + '/' + fileName, replacePlaceholders(contents, nameParts));
});

if (files.indexOf('_notice.txt') >= 0) {
  var notice = fs.readFileSync(scaffoldFolder + '/_notice.txt', 'utf8');
  console.log(replacePlaceholders(notice, nameParts));
}

function replacePlaceholders(text, nameParts) {
  var scene = nameParts[0];

  var componentPath = nameParts.slice(1).join('/');
  var componentString = nameParts.slice(1).join('-');

  return text.split('$$CapitalScene$$').join(changeCase.pascalCase(scene)).split('$$dash-scene$$').join(changeCase.paramCase(scene)).split('$$camelScene$$').join(changeCase.camelCase(scene)).split('$$CapitalComponent$$').join(changeCase.pascalCase(componentString)).split('$$camelComponent$$').join(changeCase.camelCase(componentString)).split('$$path-component$$').join(componentPath).split('$$dash-component$$').join(componentString);
}