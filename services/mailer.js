const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')

const { errorLog } = require('../utils/helpers')

const options = {
  apiKey: 'xxxxxxxxxx'
}

module.exports = class Mailer {
  constructor() {
    this.client = nodemailer.createTransport(nodemailerSendgrid(options))
  }

  async sendMail(emailAddress, data) {
    let response
    const { name, closingDetails, drawdownsDetails, maxDrawdown, stockReturn, dates } = data
    const message = {
      from: 'stock@manager.com',
      to: emailAddress,
      subject: 'Your EOD stock details',
      dynamic_template_data: {
        name,
        closingDetails,
        drawdownsDetails,
        maxDrawdown,
        stockReturn,
        dates
      },
      template_id: 'd-3d7d201952054a43acd84e75e4e83402'
    }

    try {
      response = await this.client.sendMail(message)
    } catch (err) {
      console.log('Errors occurred, failed to deliver message')

      if (err.response && err.response.body && err.response.body.errors) {
        err.response.body.errors.forEach(error => errorLog([error.field, error.message]))
      } else {
        console.log(err)
      }
      return false
    }
    console.log('Message delivered with code %s %s', response[0].statusCode, response[0].statusMessage)
    return true
  }
}
