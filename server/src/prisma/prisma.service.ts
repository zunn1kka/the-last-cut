import { Injectable, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL as string;
    const logger = new Logger('test controller');

    logger.error(connectionString);

    const adapter = new PrismaPg({
      connectionString,
    });
    super({ adapter });
  }
}
