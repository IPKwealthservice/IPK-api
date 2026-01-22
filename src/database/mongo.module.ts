import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGO_CLIENT, MONGO_DB } from './mongo.constants';
import { MongooseModule } from '@nestjs/mongoose';

@Global() // make available app-wide
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI') || config.get<string>('DATABASE_URL');
        return {
          uri: uri || undefined,
        };
      },
    }),
  ],
  providers: [
    {
      provide: MONGO_CLIENT,
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI') || config.get<string>('DATABASE_URL');
        if (!uri) {
          console.warn('⚠️  MongoDB not configured - skipping connection');
          return null;
        }

        const client = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          },
          maxPoolSize: 10,
          minPoolSize: 2,
          maxIdleTimeMS: 60000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          serverSelectionTimeoutMS: 10000,
          retryWrites: true,
          retryReads: true,
        });

        try {
          await client.connect();
          await client.db('admin').command({ ping: 1 });
          console.log('✅ MongoDB connected successfully');
          return client;
        } catch (error) {
          console.warn('⚠️  MongoDB connection failed - continuing without database:', (error as Error).message);
          return null;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: MONGO_DB,
      useFactory: (config: ConfigService, client: MongoClient) => {
        const dbName = config.get<string>('MONGODB_DBNAME') || 'ipkcrm';
        return client.db(dbName);
      },
      inject: [ConfigService, MONGO_CLIENT],
    },
  ],
  exports: [MONGO_CLIENT, MONGO_DB, MongooseModule],
})
export class MongoModule {}
