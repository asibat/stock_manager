const chalk = require('chalk')
const { isUndefined } = require('lodash')

const { examplesText, quandlBaseUrl } = require('./constants')

const errorLog = errors => {
  if (Array.isArray(errors)) {
    errors.forEach(error => console.log(chalk.red(error)))
  } else {
    console.log(chalk.red(errors))
  }
}

const styleOutput = (option, value) => chalk[option](value)

const usage = () => console.log(examplesText)

const splitRange = val => val.split('..')

const initRequestOptions = (params, method = 'GET') => {
  const options = { method, json: true }
  const { stockSymbol, stockDate, apiKey } = params
  let splitDates = splitRange(stockDate)

  if (splitDates.length > 1) {
    options.startDate = splitDates[0]
    options.endDate = splitDates[1]
  } else {
    options.startDate = stockDate
    options.endDate = stockDate
  }
  options.uri = `${quandlBaseUrl}/${stockSymbol}?start_date=${options.startDate}&end_date=${
    options.endDate
  }&api_key=${apiKey}`

  return options
}

const isValidParams = (stockSymbol, stockDate, apiKey) =>
  !isUndefined(stockSymbol) || !isUndefined(stockDate) || !isUndefined(apiKey)

const propertyValue = (style, value, type = 'en-IN', outputType = 'cli') => {
  let formatter = new Intl.NumberFormat(type, { style, maximumFractionDigits: 2 }).format(value)

  if (outputType === 'email') {
    if (value > 0 && style === 'percent') {
      return `+${formatter}`
    } else {
      return formatter
    }
  } else {
    if (value > 0 && style === 'percent') {
      return `${styleOutput('green', `+${formatter}`)}`
    } else if (value < 0 && style === 'percent') {
      return styleOutput('red', formatter)
    } else {
      return formatter
    }
  }
}

const parseFinalOutput = eodDetails => {
  const { name, result, maxDrawdown, stockReturn } = eodDetails
  const output = { name, closingDetails: [], drawdownsDetails: [] }

  for (let stock of result) {
    const { closingDetails, drawdownsDetails } = output
    const { date, low, high, close, drawdown } = stock

    closingDetails.push(
      `${styleOutput('blueBright', date)}: ${styleOutput('bold', 'Closed')} at ${styleOutput(
        'bold',
        close
      )} (${low} ~ ${high})`
    )
    drawdownsDetails.push(`${propertyValue('percent', drawdown)} (${high} on ${date} -> ${low} on ${date})`)
  }

  output['maxDrawdown'] = `${styleOutput('blueBright', 'Maximum drawdown')}: ${propertyValue(
    'percent',
    maxDrawdown.drawdown
  )} (${maxDrawdown.close} on ${maxDrawdown.date} -> ${maxDrawdown.low} on ${maxDrawdown.date})`

  output['stockReturn'] = `${styleOutput('blueBright', 'Return')}: ${styleOutput(
    'bold',
    propertyValue('decimal', stockReturn.returnValue)
  )} [${propertyValue('percent', stockReturn.returnPercentage)}] (${result[result.length - 1].low} on ${
    result[result.length - 1].date
  } -> ${result[0].low} on ${result[0].date})`

  return output
}

const parseFinalOutEmail = eodDetails => {
  const { name, result, maxDrawdown, stockReturn, dates } = eodDetails
  const output = { name, dates, closingDetails: [], drawdownsDetails: [] }

  for (let stock of result) {
    const { closingDetails, drawdownsDetails } = output
    const { date, low, high, close, drawdown } = stock

    closingDetails.push({ item: `${date}: ${'Closed'} at ${close} (${low} ~ ${high})` })
    drawdownsDetails.push({
      item: `${propertyValue('percent', drawdown, undefined, 'email')} (${high} on ${date} -> ${low} on ${date})`
    })
  }

  output['maxDrawdown'] = `${propertyValue('percent', maxDrawdown.drawdown, undefined, 'email')} (${
    maxDrawdown.close
  } on ${maxDrawdown.date} -> ${maxDrawdown.low} on ${maxDrawdown.date})`

  output['stockReturn'] = `${propertyValue('decimal', stockReturn.returnValue, undefined, 'email')} [${propertyValue(
    'percent',
    stockReturn.returnPercentage,
    undefined,
    'email'
  )}] (${result[result.length - 1].low} on ${result[result.length - 1].date} -> ${result[0].low} on ${result[0].date})`

  return output
}

module.exports = {
  errorLog,
  usage,
  splitRange,
  initRequestOptions,
  isValidParams,
  propertyValue,
  parseFinalOutput,
  styleOutput,
  parseFinalOutEmail
}
