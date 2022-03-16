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

  send(to: string, html: string, subject: string, text: string) {
    this.instance.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.configService.get('MAILJET_SENDER'),
            Name: this.configService.get('API_NAME'),
          },
          To: [
            {
              Email: to,
              Name: 'to',
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
          CustomID: Date.now().toString(),
        },
      ],
    });
  }

  async sendActivationMail(to: string, link: string) {
    const html = `
                  <h3>Activation link</h3>
                  <a href="${link}">${link}</a>
                `;

    const subject = 'Activation link';
    const textPart = 'Activation link';

    this.send(to, html, subject, textPart);
  }
}
