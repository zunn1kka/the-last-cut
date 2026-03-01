import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
}
