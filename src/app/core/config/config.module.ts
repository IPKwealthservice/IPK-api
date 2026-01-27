import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      // ✅ IMPORTANT: load the .env from project root (same folder as package.json)
      envFilePath: ['.env'],

      // ✅ ensure .env is used
      ignoreEnvFile: false,

      // ✅ keep your custom config loader
      load: [DatabaseConfig],

      // ✅ while fixing env issues, keep cache OFF
      cache: false,

      // optional: you can enable this later
      expandVariables: true,
    }),
  ],
})
export class ApiConfigModule {}
