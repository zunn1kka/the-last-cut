import { Module } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, FileService],
})
export class AdminModule {}
