import { Module } from '@nestjs/common';
import { PersonRoleService } from './person-role.service';
import { PersonRoleController } from './person-role.controller';

@Module({
  controllers: [PersonRoleController],
  providers: [PersonRoleService],
})
export class PersonRoleModule {}
