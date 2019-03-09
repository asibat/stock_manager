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

module.exports = {
  errorLog,
  usage,
  splitRange,
  initRequestOptions,
  isValidParams,
  propertyValue
}
