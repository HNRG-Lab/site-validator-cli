#!/usr/bin/env node
'use strict'

/*
Require statements
 */
const minimist = require('minimist')
const sanitize = require('sanitize-filename')
const pkg = require('./package.json')
const getHelpText = require('./lib/get-help-text')
const clearCache = require('./lib/clear-cache')
const getOption = require('./lib/get-option')
const getUrls = require('./lib/get-urls')
const validatePages = require('./lib/validate-pages')
const printSummary = require('./lib/print-summary')
const exportOutput = require('./lib/export-output')
const { cyanOnBlack } = require('./lib/clc')
const exit = require('./lib/exit')

/*
Parsing query parameters
 */
const query = process.argv[2]
const argv = minimist(process.argv.slice(2))
const outputName = `${new Date().toISOString().substring(0, 19).replace(/[:\-_]/gi, '')}`

let options = {
  cacheTime: getOption(['cache', 'cacheTime'], argv),
  clearCache: getOption(['clear-cache', 'clearCache'], argv),
  failfast: getOption(['ff'], argv),
  verbose: getOption(['verbose'], argv),
  quiet: getOption(['quiet'], argv),
  debug: getOption(['debug'], argv),
  singlePage: getOption(['page'], argv),
  isLocal: getOption(['local', 'isLocal'], argv),
  output: argv.output ? argv.output === true ? outputName : sanitize(argv.output) : false,
  path: argv.path ? getOption(['path', 'url'], argv) : argv._[0]
}

/*
Process query parameters
 */
var helpKW = ['help', '-h', '--help']
if (!query || helpKW.map(kw => { return process.argv.includes(kw) }).includes(true)) {
  exit(getHelpText())
}

var versionKW = ['version', '-v', '--version']
if (versionKW.map(kw => { return process.argv.includes(kw) }).includes(true)) {
  exit(pkg.version)
}

if (options.clearCache) {
  clearCache('sitemap')
  if (options.path === undefined) {
    exit('No path entered, exiting...')
  }
}

/*
Main Process
 */
(async () => {
  try {
    let pagesToValidate = await getUrls(options)
    console.log(`\nEvaluating a total of ${pagesToValidate.length} pages`)
    console.log('═════════════════════════════════════════════════════════════')
    if (options.verbose) { console.log('') }
    let results = await validatePages(pagesToValidate, options)
    console.log('═════════════════════════════════════════════════════════════')
    printSummary(options.path, results)
    if (options.output) {
      exportOutput(results, options)
    }
    exit(cyanOnBlack('Finished Checking, have an A-1 Day!'))
  } catch (error) {
    exit(error, true)
  }
})()
