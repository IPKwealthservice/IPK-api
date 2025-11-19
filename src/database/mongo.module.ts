import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGO_CLIENT, MONGO_DB } from './mongo.constants';

@Global() // make available app-wide
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    {
      provide: MONGO_CLIENT,
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        if (!uri) throw new Error('MONGODB_URI is not set');

        const client = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          },
          // Connection pool settings
          maxPoolSize: 10,
          minPoolSize: 2,
          maxIdleTimeMS: 60000, // Close idle connections after 1 minute

          // Timeout settings
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          serverSelectionTimeoutMS: 10000,

          // Retry settings
          retryWrites: true,
          retryReads: true,
        });

        try {
          await client.connect();
          await client.db('admin').command({ ping: 1 });
          console.log('✅ MongoDB connected successfully');
        } catch (error) {
          console.error('❌ MongoDB connection failed:', error);
          throw error;
        }

        return client;
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
  exports: [MONGO_CLIENT, MONGO_DB],
})
export class MongoModule { }
