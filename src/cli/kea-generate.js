#! /usr/bin/env node

'use strict'

var program = require('commander')
var packageJson = require('../../package.json')
var changeCase = require('change-case')
var fs = require('fs')

program
  .version(packageJson.version)
  .description(`Usage examples:\n
    kea g scene-name                               # new scene
    kea g scene-name/component-name                # component under the scene
    kea g scene-name/component-name/really-nested  # deeply nested logic`)
  .usage('<name>')
  .parse(process.argv)

if (!program.args.length) {
  program.help()
}

const name = program.args[0]

if (!name || !name.match(/^[a-z][a-z0-9\-/]+$/)) {
  console.error(`Error: name must be lowercase alphanumeric with optional dashes`)
  process.exit()
}

let appFolder = 'app'

// check if the scenes folder exists
try {
  fs.statSync(`./${appFolder}/scenes`)
} catch (e) {
  try {
    appFolder = 'src'
    fs.statSync(`./${appFolder}/scenes`)
  } catch (e) {
    console.error(`Can't find the ./app/scenes or ./src/scenes folder! Are you in a kea project?`)
    process.exit()
  }
}

const nameParts = name.split('/')
const scene = nameParts[0]
const sceneFolder = `./${appFolder}/scenes/${scene}`
const fullFolder = `./${appFolder}/scenes/${name}`

const scaffoldFolder = `${__dirname}/../../assets/scaffolds/${nameParts.length === 1 ? 'scene' : 'code'}`
const folderToGenerate = nameParts.length === 1 ? sceneFolder : fullFolder

// check if the folder exists
try {
  fs.statSync(folderToGenerate)
  console.error(`File or folder "${folderToGenerate}" already exists`)
  process.exit()
} catch (e) {
}

const files = fs.readdirSync(scaffoldFolder)

if (files.length < 0) {
  console.error(`Something is wrong with the scaffold folder!`)
  process.exit()
}

fs.mkdirSync(folderToGenerate)
files.filter(f => f !== '_notice.txt').forEach(fileName => {
  const contents = fs.readFileSync(`${scaffoldFolder}/${fileName}`, 'utf8')
  fs.writeFileSync(`${folderToGenerate}/${fileName}`, replacePlaceholders(contents, nameParts))
})

if (files.indexOf('_notice.txt') >= 0) {
  const notice = fs.readFileSync(`${scaffoldFolder}/_notice.txt`, 'utf8')
  console.log(replacePlaceholders(notice, nameParts))
}

function replacePlaceholders (text, nameParts) {
  const scene = nameParts[0]

  const componentPath = nameParts.slice(1).join('/')
  const componentString = nameParts.slice(1).join('-')

  return text.split('$$CapitalScene$$').join(changeCase.pascalCase(scene))
    .split('$$dash-scene$$').join(changeCase.paramCase(scene))
    .split('$$camelScene$$').join(changeCase.camelCase(scene))
    .split('$$CapitalComponent$$').join(changeCase.pascalCase(componentString))
    .split('$$camelComponent$$').join(changeCase.camelCase(componentString))
    .split('$$path-component$$').join(componentPath)
    .split('$$dash-component$$').join(componentString)
}
