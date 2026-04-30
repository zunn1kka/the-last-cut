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
    const clientUrl = this.configService.getOrThrow('CLIENT_URL'); // http://localhost:3000
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`; // 👈 Проверьте этот URL

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
