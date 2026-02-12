import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, token: string, username: string) {
    const verificationUrl = `${this.configService.getOrThrow('API_URL')}/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Подтверждение email на киносайте',
      template: './verification',
      context: {
        username,
        verificationUrl,
        supportEmail: this.configService.getOrThrow('SUPPORT_EMAIL'),
      },
    });
  }
}
