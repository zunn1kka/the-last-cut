import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminOnly } from 'src/auth/decorators/admin.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreatePersonRoleDto } from './dto/create-person-role.dto';
import { UpdatePersonRoleDto } from './dto/update-person-role.dto';
import { PersonRoleService } from './person-role.service';

@Controller('persons-roles')
@ApiTags('personsRoles')
@ApiBearerAuth('JWT-auth')
export class PersonRoleController {
  constructor(private readonly personRoleService: PersonRoleService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все роли персон',
    description:
      'Возвращает список всех возможных ролей в фильмах (актер, режиссер и т.д.)',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные параметры запроса',
  })
  async findAll() {
    return this.personRoleService.findAll();
  }

  @ApiOperation({
    summary: 'Получить роль по ID',
    description: 'Возвращает подробную информацию о конкретной роли',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID идентификатор роли',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiOkResponse({
    description: 'Роль успешно найдена',
  })
  @ApiNotFoundResponse({
    description: 'Роль с указанным ID не найдена',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  @Get(':roleId')
  async findOne(@Param('roleId') roleId: string) {
    return this.personRoleService.findOne(roleId);
  }

  @Post()
  @AdminOnly()
  @ApiOperation({
    summary: 'Создать новую роль',
    description:
      'Создает новую роль для персон в контенте. Только для администраторов.',
  })
  @ApiBody({
    description: 'Данные для создания роли',
    type: CreatePersonRoleDto,
  })
  @ApiCreatedResponse({
    description: 'Роль успешно создана',
    type: CreatePersonRoleDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные',
  })
  @ApiConflictResponse({
    description: 'Роль с таким названием',
  })
  async create(
    @Authorized('id') userId: string,
    @Body() dto: CreatePersonRoleDto,
  ) {
    return this.personRoleService.create(userId, dto);
  }

  @Put(':roleId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Обновить роль',
    description: 'Обновляет информацию о роли. Только для администраторов.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID идентификатор роли',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiBody({
    description: 'Данные для обновления роли',
    type: UpdatePersonRoleDto,
  })
  @ApiOkResponse({
    description: 'Роль успешно обновлена',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiNotFoundResponse({
    description: 'Роль с указанным ID не найдена',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные или ID',
  })
  @ApiConflictResponse({
    description: 'Роль с таким названием или slug уже существует',
  })
  async update(
    @Authorized('id') userId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdatePersonRoleDto,
  ) {
    return this.personRoleService.update(userId, roleId, dto);
  }

  @Delete(':roleId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Удалить роль',
    description:
      'Удаляет роль по ID. Только для администраторов. Роль не может быть удалена, если она используется.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID идентификатор роли',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiNoContentResponse({
    description: 'Роль успешно удалена',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiNotFoundResponse({
    description: 'Роль с указанным ID не найдена',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  @ApiConflictResponse({
    description: 'Невозможно удалить роль, так как она используется персонами',
  })
  async delete(
    @Authorized('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.personRoleService.delete(userId, roleId);
  }
}
