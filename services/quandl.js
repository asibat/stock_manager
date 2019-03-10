const rp = require('request-promise')
const { maxBy, isEmpty } = require('lodash')

const { columns } = require('../utils/constants')
const { errorLog, usage, isValidParams, initRequestOptions, propertyValue } = require('../utils/helpers')

const getEOD = async (stockSymbol, stockDate, apiKey) => {
  let response

  if (!isValidParams(stockSymbol, stockDate, apiKey)) {
    errorLog('Invalid Input, Please provide stockSymbol, dates, apiKey')
    usage()
    return
  }

  const options = initRequestOptions({ stockSymbol, stockDate, apiKey })

  try {
    response = await rp(options)
  } catch (e) {
    const { quandl_error } = e.error
    errorLog(quandl_error.message)
    return
  }
  if (!response || isEmpty(response)) return

  return parseResult(response.dataset)
}

const parseResult = eodDetails => {
  const { name, column_names, data } = eodDetails
  const indexes = {}
  let result = []

  for (let i = 0; i < column_names.length; i++) {
    indexes[column_names[i]] = i
  }

  for (let stock of data) {
    const temp = {}
    columns.forEach(column => (temp[column.toLowerCase()] = stock[indexes[column]]))

    result.push(temp)
  }
  result = calculateDrawdowns(result)
  const maxDrawdown = getMaxDrawdown(result)
  const stockReturn = calculateReturn(result)

  return { name, result, maxDrawdown, stockReturn }
}

const calculateDrawdowns = stockDetails => {
  for (let stock of stockDetails) {
    const { low, high } = stock
    let drawdown = (low - high) / high

    stock['drawdown'] = drawdown
  }
  return stockDetails
}

const getMaxDrawdown = stockPrices => maxBy(stockPrices, o => o.drawdown)

const calculateReturn = stocks => {
  const firstDayValue = stocks[stocks.length - 1].close
  const lastDayValue = stocks[0].close

  const returnValue = lastDayValue - firstDayValue
  const returnPercentage = returnValue / firstDayValue

  return { returnValue, returnPercentage }
}

module.exports = { getEOD }
