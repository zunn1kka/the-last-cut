import { PartialType } from '@nestjs/swagger';
import { CreatePersonRoleDto } from './create-person-role.dto';

export class UpdatePersonRoleDto extends PartialType(CreatePersonRoleDto) {}
