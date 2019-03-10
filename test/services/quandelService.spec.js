const { omit, cloneDeep } = require('lodash')
const { expect } = require('chai')
const chai = require('chai')
const nock = require('nock')

const { getEOD } = require('../../services/quandl')
const { quandlBaseUrl } = require('../../utils/constants')

const expectedQuandlResponse = require('../fixtures/stock')
const expectedParsedResponse = require('../fixtures/parsedStockResults')

chai.use(require('chai-http'))
chai.use(require('chai-subset'))

describe('QuandlService', function() {
  describe('Get EOD Stock Details', function() {
    it('throws an error when the quandl code is invalid', async () => {
      const thrownError = {
        quandl_error: {
          message: 'You have submitted an incorrect Quandl code. Please check your Quandl codes and try again.'
        }
      }

      nock(quandlBaseUrl)
        .get('/non-existing-stock-symbol?start_date=2018-01-02&end_date=2018-01-05&api_key=BnLaVTAsS7UNuD43xycq')
        .replyWithError(thrownError)

      await expect(
        async () => await getEOD('non-existing-stock-symbol', '2018-01-02..2018-01-05', 'BnLaVTAsS7UNuD43xycq')
      ).to.throw
    })

    it('throws an error when date parameter is invalid', async () => {
      const thrownError = {
        quandl_error: {
          message: 'You have submitted incorrect query parameters. Please check your API call syntax and try again.'
        }
      }

      nock(quandlBaseUrl)
        .get('/aapl?start_date=2018&end_date=2018-01-05&api_key=BnLaVTAsS7UNuD43xycq')
        .replyWithError(thrownError)

      await expect(async () => await getEOD('aapl', '2018..2018-01-05', 'BnLaVTAsS7UNuD43xycq')).to.throw
    })

    it('throws an error when apikey parameter is invalid', async () => {
      const thrownError = {
        quandl_error: {
          message: 'We could not recognize your API key. Please check your API key and try again.'
        }
      }

      nock(quandlBaseUrl)
        .get('/aapl?start_date=2018-01-02&end_date=2018-01-05&api_key=BnLaVTAsS7UNuD43x')
        .replyWithError(thrownError)

      await expect(async () => await getEOD('aapl', '2018-01-02..2018-01-05', 'BnLaVTAsS7UNuD43x')).to.throw
    })

    it('returns EOD stock price details', async () => {
      nock(quandlBaseUrl)
        .get('/aapl?start_date=2018-01-02&end_date=2018-01-05&api_key=BnLaVTAsS7UNuD43xycq')
        .reply(200, expectedQuandlResponse)

      const res = await getEOD('aapl', '2018-01-02..2018-01-05', 'BnLaVTAsS7UNuD43xycq')

      expect(res).to.deep.equal(expectedParsedResponse)
    })
  })
})
