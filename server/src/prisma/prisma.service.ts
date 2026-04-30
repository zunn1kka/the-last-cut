import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.POSTGRES_URL as string;

    console.log(connectionString);

    const adapter = new PrismaPg({
      connectionString,
    });
    super({ adapter });
  }
}
