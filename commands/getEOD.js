const inquirer = require('inquirer')
const chalk = require('chalk')
const pad = require('pad')
const { isUndefined, isEmpty } = require('lodash')

const Mailer = require('../services/mailer')
const {
  eodQuestions,
  confirmMoreEODDetails,
  confirmMoreDrawdownsDetails,
  confirmSendDetailsByEmail,
  confirmEmailAddress
} = require('../utils/constants')
const { errorLog, parseFinalOutput, styleOutput, parseFinalOutEmail } = require('../utils/helpers')
const { getEOD } = require('../services/quandl')

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
  const { stockSymbol, dates, apiKey } = answers

  console.log('Your request')
  console.log('------------------')

  console.log(pad(chalk.grey('Stock Symbol: ')), stockSymbol)
  console.log(pad(chalk.grey('Date: ')), dates)
  console.log(pad(chalk.grey('API KEY: ')), '****************')

  let eodDetails

  try {
    eodDetails = await getEOD(stockSymbol, dates, apiKey)
  } catch (e) {
    errorLog(e)
    return
  }

  if (!eodDetails || isEmpty(eodDetails) || isUndefined(eodDetails)) {
    errorLog('NO AVAILABLE DATA')
    return
  }

  return eodDetails
}

const getStockDetails = async () => {
  const eodAnswers = await inquirer.prompt(eodQuestions)
  let eodDetails

  try {
    eodDetails = await retrieveData(eodAnswers)
  } catch (e) {
    errorLog(e)
    return
  }

  if (!eodDetails || isUndefined(eodDetails) || isEmpty(eodDetails)) return

  const finalOutput = parseFinalOutput(eodDetails)
  printOutput(finalOutput)

  const { closingDetails, drawdownsDetails } = finalOutput

  const moreEODPrices = await inquirer.prompt(confirmMoreEODDetails)
  if (moreEODPrices.confirmed) printMoreDetails(closingDetails)

  const moreDrawdowns = await inquirer.prompt(confirmMoreDrawdownsDetails)
  if (moreDrawdowns.confirmed) printMoreDetails(drawdownsDetails)

  eodDetails['dates'] = eodAnswers.dates
  await triggerSendEmail(parseFinalOutEmail(eodDetails))
}

const triggerSendEmail = async eodDetails => {
  let sent = false
  let confirmSendEmail = await inquirer.prompt(confirmSendDetailsByEmail)

  if (confirmSendEmail.confirmed) {
    let confirmEmailAddressAnswer = await inquirer.prompt(confirmEmailAddress)

    if (confirmEmailAddressAnswer.hasOwnProperty('email')) {
      while (!sent) {
        const mailer = new Mailer()
        sent = await mailer.sendMail(confirmEmailAddressAnswer.email, eodDetails)

        if (!sent) {
          console.log(styleOutput('bold', 'PLEASE TRY AGAIN: (ctrl+c to cancel task) '))
          confirmEmailAddressAnswer = await inquirer.prompt(confirmEmailAddress)
        }
      }
    }
  }
}

module.exports = { getStockDetails }
