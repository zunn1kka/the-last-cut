import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './auth/mail/mail.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CommentModule } from './comment/comment.module';
import { ContentModule } from './content/content.module';
import { GenreModule } from './genre/genre.module';
import { PersonRoleModule } from './person-role/person-role.module';
import { PersonModule } from './person/person.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatingsModule } from './ratings/ratings.module';
import { UserModule } from './user/user.module';
import { EpisodeModule } from './episode/episode.module';
import { WatchStatusModule } from './watch-status/watch-status.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CollectionsModule } from './collections/collections.module';

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
    AdminModule,
    EpisodeModule,
    WatchStatusModule,
    NotificationsModule,
    CollectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
