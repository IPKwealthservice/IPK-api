// src/prisma/prisma.service.ts
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  INestApplication,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ["warn", "error"],
    });
  }

  /* ================= CONNECT ================= */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("✅ Prisma connected to MongoDB");
    } catch (error) {
      this.logger.error("❌ Failed to connect Prisma to MongoDB", error);
      throw error;
    }
  }

  /* ================= NEST SHUTDOWN HOOK ================= */
  async enableShutdownHooks(app: INestApplication) {
    (this.$on as any)("beforeExit", async () => {
      this.logger.log("⚠️ Prisma beforeExit triggered");
      await app.close();
    });
  }

  /* ================= DISCONNECT ================= */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log("🧹 Prisma disconnected");
    } catch (error) {
      this.logger.error("❌ Error disconnecting Prisma", error);
    }
  }
}
