// src/prisma/prisma.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['warn', 'error'],
      transactionOptions: {
        maxWait: 10_000, // wait for a tx slot (ms)
        timeout: 15_000, // tx lifetime (ms)
      },
    });
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected to MongoDB');
    } catch (error) {
      this.logger.error('❌ Failed to connect Prisma to MongoDB:', error);
      throw error;
    }
  }
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Prisma:', error);
    }
  }
}
