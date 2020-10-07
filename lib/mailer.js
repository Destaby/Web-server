'use strict';

const nodemailer = require('nodemailer');

class Mailer {
  constructor(auth) {
    console.log('Start Mailer');
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth,
    });
  }

  async message({ to, subject, message }) {
    const mail = { to, subject, text: message };
    return this.transport.sendMail(mail);
  }

  async exit() {
    this.transport.close();
    console.log('Stop Mailer');
  }
}

module.exports = Mailer;
