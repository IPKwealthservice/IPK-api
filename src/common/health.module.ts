import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaAppModule } from '../../prisma';

@Module({
  imports: [PrismaAppModule],
  controllers: [HealthController],
})
export class HealthModule {}
