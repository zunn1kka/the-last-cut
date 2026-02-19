import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/auth.guard';
import { MailModule } from './auth/mail/mail.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CommentModule } from './comment/comment.module';
import { ContentModule } from './content/content.module';
import { GenreModule } from './genre/genre.module';
import { PersonRoleModule } from './person-role/person-role.module';
import { PersonModule } from './person/person.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CommentModule,
    GenreModule,
    PersonModule,
    PersonRoleModule,
    MailModule,
    ContentModule,
    BookmarksModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => {
        return new JwtGuard(reflector);
      },
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
