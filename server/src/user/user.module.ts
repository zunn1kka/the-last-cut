import { Module } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, FileService],
})
export class UserModule {}
