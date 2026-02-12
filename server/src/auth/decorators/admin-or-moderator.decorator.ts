import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums';
import { JwtGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function AdminOrModerator() {
  return applyDecorators(UseGuards(JwtGuard, RolesGuard));
  Roles(UserRole.MODERATOR, UserRole.ADMIN);
}
