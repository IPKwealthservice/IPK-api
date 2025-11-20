// src/app/core/graphql/graphql.module.ts
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { environment } from '../../../environments/environment';
import { GraphQLLoggingPlugin } from './plugins/graphql-logging.plugin';

const isProd = !!environment.production;

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      // Use in-memory schema to avoid file watching restart loops
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      introspection: true, // allows Apollo Sandbox & tools in dev
      csrfPrevention: false, // avoid 400 errors from CSRF plugin
      plugins: isProd ? [] : [new GraphQLLoggingPlugin()],
      context: ({
        req,
        res,
      }: {
        req: import('express').Request;
        res: import('express').Response;
      }) => ({ req, res }),
    }),
  ],
  exports: [GraphQLModule],
})
export class GraphqlModule { }
