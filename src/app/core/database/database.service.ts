import { Inject, Injectable } from '@nestjs/common';
import * as config from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

import { DatabaseConfig } from '../config/database.config';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(
    @Inject(DatabaseConfig.KEY)
    private databaseConfig: config.ConfigType<typeof DatabaseConfig>,
  ) { }

  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.databaseConfig.host;

    if (!uri) {
      console.warn('⚠️  DATABASE_URL not configured - MongoDB disabled');
      // Return config without URI to skip connection attempt
      return {};
    }

    return {
      uri: uri,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    };
  }
}
