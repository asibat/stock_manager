const chalk = require('chalk')
const { isUndefined } = require('lodash')

const { examplesText, quandlBaseUrl } = require('./constants')

const errorLog = error => {
  const eLog = chalk.red(error)
  console.log(eLog)
}
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

const propertyValue = (style, value, type = 'en-IN') => {
  let formatter = new Intl.NumberFormat(type, { style, maximumFractionDigits: 2 }).format(value)

  return value > 0 && style === 'percent' ? `+${formatter}` : formatter
}

const parseFinalOutput = eodDetails => {
  const { name, result, maxDrawdown, stockReturn } = eodDetails
  const output = { name, closingDetails: [], drawdownsDetails: [] }

  for (let stock of result) {
    const { closingDetails, drawdownsDetails } = output
    const { date, low, high, close, drawdown } = stock

    closingDetails.push(`${date}: Closed at ${close} (${low}~${high})`)
    drawdownsDetails.push(`${drawdown} (${high} on ${date} -> ${low} on ${date})`)
  }

  output['maxDrawdown'] = `Maximum drawdown: ${maxDrawdown.drawdown} (${maxDrawdown.close} on ${maxDrawdown.date} -> ${
    maxDrawdown.low
  } on ${maxDrawdown.date}`

  output['stockReturn'] = `Return: ${stockReturn.returnValue} [${stockReturn.returnPercentage}] (${
    result[result.length - 1].low
  } on ${result[result.length - 1].date} -> ${result[0].low} on ${result[0].date})`

  return output
}

module.exports = {
  errorLog,
  usage,
  splitRange,
  initRequestOptions,
  isValidParams,
  propertyValue,
  parseFinalOutput
}
