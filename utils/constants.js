const examplesText = `
  Examples:
    $ stock --help
    $ stock getEOD AAPL 2018-03-01..2018-03-05 XXXXX
    $ stock get AAPL 2018-03-01 XXXXX
  `

const columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Dividend']

const quandlBaseUrl = 'https://www.quandl.com/api/v3/datasets/EOD'

const eodQuestions = [
  { type: 'input', name: 'stockSymbol', message: 'Enter your stock code' },
  { type: 'input', name: 'dates', message: 'Enter your preferred date or range of dates' },
  { type: 'password', name: 'apiKey', message: 'Enter your API KEY', mask: '*' }
]

const confirmMoreEODDetails = [
  {
    type: 'confirm',
    name: 'eodPrices',
    message: 'See more details about EOD prices? ',
    default: false
  }
]

const confirmMoreDrawdownsDetails = [
  {
    type: 'confirm',
    name: 'eodPrices',
    message: 'See more details about Drawdowns? ',
    default: false
  }
]

const confirmSendDetailsByEmail = [
  {
    type: 'confirm',
    name: 'confirmed',
    message: 'Send Details to your email? '
  }
]
const confirmEmailAddress = [
  {
    type: 'input',
    name: 'email',
    message: 'please enter you email address: '
  }
]

module.exports = {
  examplesText,
  columns,
  quandlBaseUrl,
  eodQuestions,
  confirmMoreEODDetails,
  confirmMoreDrawdownsDetails,
  confirmSendDetailsByEmail,
  confirmEmailAddress
}
