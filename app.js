#!/usr/bin/env node
const program = require('commander')
const { getStockDetails } = require('./commands/getEOD')

const { usage, errorLog } = require('./utils/helpers')

const args = process.argv
program.version('0.0.1', '-v, --version')

program
  .command('getEOD')
  .alias('get')
  .description('Retrieve your stock details')
  .action(async () => await getStockDetails())

program.on('--help', () => usage())

program.parse(args)

if (args.length < 3) {
  errorLog(`Invalid input, please check --help`)
  program.help()
}
