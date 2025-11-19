import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './environments/environment';
import { PrismaService } from '../prisma/prisma.service';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    app.enableCors({
      origin: ['http://localhost:5173', 'https://studio.apollographql.com', '*'],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
      exposedHeaders: ['Content-Length', 'Date'],
    });

    // Basic HTTP request logging in dev for visibility
    if (!environment.production) {
      const httpLogger = new Logger('HTTP');
      app.use((req: Request, res: Response, next: NextFunction) => {
        const { method } = req;
        const url: string = req.originalUrl || req.url;
        const start = process.hrtime.bigint();
        res.on('finish', () => {
          const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
          const statusCode = res.statusCode;
          const cl = res.getHeader?.('content-length');
          const contentLength = Array.isArray(cl) ? cl.join(',') : String(cl ?? '-');
          httpLogger.log(`${method} ${url} ${statusCode} ${contentLength} - ${ms.toFixed(0)}ms`);
        });
        next();
      });
    }

    const port = environment.port ?? 3333;
    await app.listen(port);

    // Visible startup URLs for REST and GraphQL
    const displayedBase = `http://localhost:${port}`;
    const displayedGql = `${displayedBase}/graphql`;
    const bootLogger = new Logger('NestApplication');
    bootLogger.log(`🚀 REST API running at ${displayedBase}`);
    bootLogger.log(`🚀 GraphQL running at ${displayedGql}`);

    // Graceful shutdown handlers at process level (Prisma 5+ compatible)
    const prismaService = app.get(PrismaService);
    const gracefulShutdown = async (signal: string) => {
      logger.log(`${signal} received, starting graceful shutdown...`);
      try {
        await prismaService.$disconnect();
        await app.close();
        logger.log('Application closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}
void bootstrap();
