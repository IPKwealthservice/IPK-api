import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [DatabaseConfig],
      isGlobal: true,
      // Load local .env so DATABASE_URL is available in dev
      ignoreEnvFile: false,
      cache: true,
    }),
  ],
})
export class ApiConfigModule {}
