const inquirer = require('inquirer')
const chalk = require('chalk')
const pad = require('pad')

const { errorLog, parseFinalOutput, styleOutput } = require('../utils/helpers')
const { getEOD } = require('../services/quandl')

const questions = [
  { type: 'input', name: 'stockSymbol', message: 'Enter your stock code' },
  { type: 'input', name: 'dates', message: 'Enter your preferred date or range of dates' },
  { type: 'input', name: 'apiKey', message: 'Enter your API KEY' }
]
const confirmMoreEODDetails = [
  {
    type: 'confirm',
    name: 'eodPrices',
    message: 'See more details about EOD prices',
    default: false
  }
]
const confirmMoreDrawdownsDetails = [
  {
    type: 'confirm',
    name: 'eodPrices',
    message: 'See more details about EOD prices',
    default: false
  }
]
const confirmSendDetailsByEmail = [
  {
    type: 'confirm',
    name: 'confirmed',
    message: 'Send Details to your email?'
  },
  {
    type: 'input',
    name: 'email',
    message: 'please enter you email address'
  }
]

const printMoreDetails = data => {
  console.log('\n')
  data.reverse().forEach(stock => console.log(stock))
  console.log('\n')
}
const printOutput = data => {
  const { name, closingDetails, drawdownsDetails, maxDrawdown, stockReturn } = data

  console.log('\n')
  console.log(styleOutput('bold', name))
  console.log('\n')
  console.log(`${styleOutput('blueBright', 'First 3 EOD Details')}: `)
  closingDetails
    .reverse()
    .slice(0, 3)
    .forEach(stock => console.log(stock))

  console.log('\n')
  console.log(`${styleOutput('blueBright', 'First 3 Drawdowns')}: `)
  drawdownsDetails.slice(0, 3).forEach(drawdown => console.log(drawdown))
  console.log('\n')
  console.log(maxDrawdown)
  console.log(stockReturn)
  console.log('\n')
}
const retrieveData = async answers => {
  let eodDetails
  const { stockSymbol, dates, apiKey } = answers

  console.log('Your request')
  console.log('------------------')

  console.log(pad(chalk.grey('Stock Symbol: ')), stockSymbol)
  console.log(pad(chalk.grey('Date: ')), dates)
  console.log(pad(chalk.grey('API KEY: ')), apiKey)

  try {
    eodDetails = await getEOD(stockSymbol, dates, apiKey)
  } catch (e) {
    console.log(e)
  }

  if (!eodDetails) {
    errorLog('NO AVAILABLE DATA')
    return
  }
  const finalOutput = parseFinalOutput(eodDetails)
  printOutput(finalOutput)
  return finalOutput
}

module.exports = async () => {
  const eodAnswers = await inquirer.prompt(questions)
  const eodDetails = await retrieveData(eodAnswers)
  const { closingDetails, drawdownsDetails } = eodDetails

  const moreEODPrices = await inquirer.prompt(confirmMoreEODDetails)
  if (moreEODPrices) printMoreDetails(closingDetails)

  const moreDrawdowns = await inquirer.prompt(confirmMoreDrawdownsDetails)
  if (moreDrawdowns) printMoreDetails(drawdownsDetails)

  const sendDetails = await inquirer.prompt(confirmSendDetailsByEmail)
  if (sendDetails.confirmed) console.log(sendDetails)
}
