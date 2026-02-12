import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const templatesDir = join(
          process.cwd(),
          'src',
          'auth',
          'mail',
          'templates',
        );

        return {
          transport: {
            host: configService.getOrThrow<string>('MAIL_HOST'),
            port: configService.getOrThrow<number>('MAIL_PORT'),
            secure: configService.getOrThrow<boolean>('MAIL_SECURE'),
            auth: {
              user: configService.getOrThrow<string>('MAIL_USER'),
              pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"Киносайт" <${configService.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: templatesDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
