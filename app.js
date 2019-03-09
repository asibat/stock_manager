#!/usr/bin/env node
const program = require('commander')
const readline = require('readline')

const { getEOD } = require('./services/quandl')
const { usage, errorLog } = require('./utils/helpers')

const args = process.argv
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

program.version('0.0.1', '-v, --version')

program
  .command('getEOD <symbol> <date> <apiKey>')
  .description('End of Day US Stock Prices - filter by a single date or a range of dates')
  .action(async (symbol, date, apiKey) => {
    let eodDetails
    try {
      eodDetails = await getEOD(symbol, date, apiKey)
    } catch (e) {
      console.log(e)
    }
    if (!eodDetails) {
      errorLog('NO AVAILABLE DATA')
      return
    }
    console.log(eodDetails)
    rl.question('Send Data? y or N  ', answer => {
      if (answer === 'N') {
        console.log('Have a nice Day!')
        rl.close()
      }

      rl.close()
    })
  })

program.on('--help', () => usage())

program.parse(args)

// we make sure the length of the arguments valid
if (args.length < 6) {
  errorLog(`Invalid input, please check --help`)
  program.help()
}
