import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private readonly infoUser = {
    id: true,
    username: true,
    email: true,
    bio: true,
    avatarUrl: true,
    telegramId: true,
    createdAt: true,
    updatedAt: true,
  };

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: this.infoUser,
    });

    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    avatar: Express.Multer.File,
  ) {
    const userAvatar = await this.getProfile(userId);
    let avatarUrl: string | null = null;

    if (avatar) {
      if (userAvatar?.avatarUrl) {
        await this.fileService.deleteFile(userAvatar.avatarUrl);
      }

      const saveAvatar = await this.fileService.saveFile(
        avatar,
        FileType.AVATAR,
      );

      avatarUrl = saveAvatar.url;
    }

    if (dto.username) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { username: dto.username },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException(
          'Пользователь с таким именем уже существует',
        );
      }
    }

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        bio: dto.bio,
        avatarUrl,
        telegramId: dto.telegramId,
        updatedAt: new Date(),
      },
      select: this.infoUser,
    });

    return { message: 'Профиль успешно обновлен', user };
  }

  async changeEmail(userId: string, dto: UpdateEmailDto) {
    const existPassword = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!existPassword) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await verify(
      existPassword?.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      select: this.infoUser,
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const currentUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (currentUser?.email === dto.email) {
      throw new BadRequestException('Новый email совпадает с текущим');
    }

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { email: dto.email, updatedAt: new Date() },
      select: this.infoUser,
    });

    return { message: 'Электронная почта успешно изменена', user };
  }

  async changePassword(userId: string, dto: UpdatePasswordDto) {
    const existPassword = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!existPassword?.passwordHash) {
      throw new UnauthorizedException('Пароль не установлен');
    }

    const isPasswordValid = await verify(
      existPassword?.passwordHash,
      dto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Текущий пароль неверный');
    }

    const isSamePassword = await verify(
      existPassword?.passwordHash,
      dto.newPassword,
    );

    if (isSamePassword) {
      throw new BadRequestException('Новый пароль совпадает с текущим');
    }

    const newPassword = await hash(dto.newPassword);

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { passwordHash: newPassword, updatedAt: new Date() },
      select: this.infoUser,
    });

    return { message: 'Пароль успешно изменен', user };
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingPassword = await verify(user?.passwordHash, dto.password);

    if (!existingPassword) {
      throw new UnauthorizedException('Пароль неверный');
    }

    const deleteUser = await this.prismaService.user.delete({
      where: { id: userId },
    });

    return { message: 'Аккаунт успешно удален', deleteUser };
  }
}
