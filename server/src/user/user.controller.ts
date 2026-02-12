import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiBearerAuth('JWT-auth')
@Authorization()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Authorized('id') userId: string) {
    return await this.userService.getProfile(userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatarUrl'))
  async updateProfile(
    @Authorized('id') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return await this.userService.updateProfile(userId, dto, avatar);
  }

  @Put('change-email')
  @HttpCode(HttpStatus.OK)
  async changeEmail(
    @Authorized('id') userId: string,
    @Body() dto: UpdateEmailDto,
  ) {
    return await this.userService.changeEmail(userId, dto);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Authorized('id') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return await this.userService.changePassword(userId, dto);
  }

  @Delete('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Authorized('id') userId: string,
    @Body() dto: DeleteAccountDto,
  ) {
    return await this.userService.deleteAccount(userId, dto);
  }
}
