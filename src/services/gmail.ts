import * as nodemailer from 'nodemailer';
import config from '../config';
const EmailTemplate = require('email-templates');
import { join } from 'path';

export class GMailService {
  private _transporter: nodemailer.Transporter;
  constructor() {
    this._transporter = nodemailer.createTransport(
      {
        service: "Gmail",
        pool: true,
        auth: {
          user: config.mailer.username,
          pass: config.mailer.password,
        },
      }
    );
  }

  private async loadTemplateSendMail(templateName: string, contexts: object) {
    let template = new EmailTemplate({
      views: {
        options: {
          extension: 'ejs'
        }
      }
    });
    return new Promise((resolve, reject) => {
      template.render(join(__dirname, '../templates', templateName), contexts).then(resolve)
        .catch(reject);
    });
  }

  async sendMail(to: string, subject: string, template: string, content?: string, data?: object)
    : Promise<void> {
    if (template) {
      let t: any = await this.loadTemplateSendMail(template, data);
      content = t;
    }
    let options = {
      from: 'Ecommerce <noreply@ecom.com>',
      to: to,
      subject: subject,
      html: content
    }

    return new Promise<void>(
      (resolve: (msg: any) => void,
        reject: (err: Error) => void) => {
        this._transporter.sendMail(
          options, (error, info) => {
            if (error) {
              console.log(`error: ${error}`);
              reject(error);
            } else {
              console.log(`Message Sent
                    ${info.response}`);
              resolve(`Message Sent
                    ${info.response}`);
            }
          })
      }
    );
  }
}
