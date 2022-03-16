import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Email } from 'node-mailjet';

@Injectable()
export class MailService {
  private instance: Email.Client;

  constructor(private configService: ConfigService) {
    this.instance = connect(
      this.configService.get('MAILJET_KEY'),
      this.configService.get('MAILJET_SECRET'),
    );
  }

  async send(to: string, html: string) {
    this.instance
      .post('send', {
        version: 'v3.1',
      })
      .request({
        Messages: [
          {
            From: {
              Email: this.configService.get('API_URL'),
              Name: this.configService.get('API_NAME'),
            },
            To: [
              {
                Email: to,
                Name: to,
              },
            ],
            HTMLPart: html,
          },
        ],
      });
  }

  async sendActivationMail(to: string, link: string) {
    const html = `
                  <h3>Activation link</h3>
                  <a href="${link}">${link}</a>
                `;

    await this.send(to, html);
  }
}
