import { PartialType } from '@nestjs/mapped-types';
import { BaseContentDto } from './base-content.dto';

export class CreateContentDto extends PartialType(BaseContentDto) {}
