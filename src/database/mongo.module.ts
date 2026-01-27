import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { MONGO_CLIENT, MONGO_DB } from './mongo.constants';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    ConfigModule,

    // ✅ Only enable Mongoose connection when URI exists
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri =
          config.get<string>('MONGODB_URI') ||
          config.get<string>('DATABASE_URL');

        if (!uri) {
          console.warn('⚠️  MongoDB URI missing. Mongoose will NOT connect.');
          // Return a dummy object that won't try to connect
          // (Mongoose will still try if `uri` exists, so keep it empty string)
          return { uri: '' };
        }

        return { uri };
      },
    }),
  ],

  providers: [
    {
      provide: MONGO_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri =
          config.get<string>('MONGODB_URI') ||
          config.get<string>('DATABASE_URL');

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
        });

        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('✅ MongoDB connected successfully');
        return client;
      },
    },

    {
      provide: MONGO_DB,
      inject: [ConfigService, MONGO_CLIENT],
      useFactory: (config: ConfigService, client: MongoClient | null) => {
        if (!client) {
          // ✅ prevent "reading 'db'" crash
          return null;
        }
        const dbName = config.get<string>('MONGODB_DBNAME') || 'ipkcrm';
        return client.db(dbName);
      },
    },
  ],

  exports: [MONGO_CLIENT, MONGO_DB, MongooseModule],
})
export class MongoModule {}
