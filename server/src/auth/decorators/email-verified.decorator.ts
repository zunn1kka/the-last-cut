import { applyDecorators, UseGuards } from '@nestjs/common';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';

export function EmailVerified() {
  return applyDecorators(UseGuards(EmailVerifiedGuard));
}
