#!/usr/bin/env node
const program = require('commander')
const readline = require('readline')

const { getEOD } = require('./services/quandl')
const { usage, errorLog, parseFinalOutput, styleOutput } = require('./utils/helpers')

const args = process.argv
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const printOutput = data => {
  const { closingDetails, drawdownsDetails, maxDrawdown, stockReturn } = data
  console.log('\n')
  closingDetails.reverse().forEach(stock => console.log(stock))
  console.log('\n')
  console.log(`${styleOutput('blueBright', 'First 3 Drawdowns')}: `)
  drawdownsDetails.splice(0, 3).forEach(drawdown => console.log(drawdown))
  console.log('\n')
  console.log(maxDrawdown)
  console.log(stockReturn)
  console.log('\n')
}
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
    const finalOutput = parseFinalOutput(eodDetails)
    printOutput(finalOutput)

    // TODO: implement send data option (email or slack)
    // rl.question('Send Data? y or N  ', answer => {
    //   if (answer === 'N') {
    //     console.log('Have a nice Day!')
    //     rl.close()
    //   }
    //
    //   rl.close()
    // })
  })

program.on('--help', () => usage())

program.parse(args)

// we make sure the length of the arguments valid
if (args.length < 6) {
  errorLog(`Invalid input, please check --help`)
  program.help()
}
