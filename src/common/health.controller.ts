import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Test database connection by accessing a collection
      const client = (this.prisma as any).$client;
      if (client) {
        await client.db('admin').command({ ping: 1 });
      } else {
        // Fallback: attempt a simple query
        await (this.prisma as any).$runCommandRaw({ ping: 1 });
      }
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
