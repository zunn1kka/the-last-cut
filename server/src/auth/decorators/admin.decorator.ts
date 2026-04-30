import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { Authorization } from './authorization.decorator';

export function AdminOnly() {
  return applyDecorators(Authorization(), UseGuards(AdminGuard));
}
