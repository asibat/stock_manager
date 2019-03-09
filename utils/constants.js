const examplesText = `
  Examples:
    $ stock --help
    $ stock getEOD AAPL 2018-03-01..2018-03-05 XXXXX
    $ stock eod AAPL 2018-03-01 XXXXX
  `

const columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Dividend']

const quandlBaseUrl = 'https://www.quandl.com/api/v3/datasets/EOD'

module.exports = {
  examplesText,
  columns,
  quandlBaseUrl
}
