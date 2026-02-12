import { Module } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  controllers: [PersonController],
  providers: [PersonService, FileService],
})
export class PersonModule {}
