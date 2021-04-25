import { makeExecutableSchema } from '@graphql-tools/schema';
import * as core from '@via-profit-services/core';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';

import * as subscriptions from '../index';

dotenv.config();

const LOG_DIR = './artifacts/log';


(async () => {

  const app = express();
  const server = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs: [core.typeDefs, subscriptions.typeDefs],
    resolvers: [core.resolvers, subscriptions.resolvers],
  });

  const subscriptionMiddleware = subscriptions.factory({
    server,
    endpoint: process.env.GRAPHQL_SUBSCRIPTION_ENDPOINT,
    redis: {
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      password: '',
    },
  });

  const { graphQLExpress } = await core.factory({
    server,
    schema,
    debug: true,
    logDir: LOG_DIR,
    middleware: [
      subscriptionMiddleware,
      ({ context }) => {

        context.emitter.on('subscriptions-client-connected', (socket) => {
          console.log('connect', socket.__connectionClientID);
        });
        context.emitter.on('subscriptions-client-disconnected', (socket) => {
          console.log('disconnect', socket.__connectionClientID);
        });

        return { context }
      },
    ],
  });


  app.use(cors());
  app.set('trust proxy', true);
  app.use(process.env.GRAPHQL_ENDPOINT, graphQLExpress);


  server.listen(Number(process.env.GRAPHQL_PORT), process.env.GRAPHQL_HOST, () => {
    // eslint-disable-next-line no-console
    console.info(`GraphQL server started at http://${process.env.GRAPHQL_HOST}:${process.env.GRAPHQL_PORT}${process.env.GRAPHQL_ENDPOINT}`);
    // eslint-disable-next-line no-console
    console.info(`Subscription server started at ws://${process.env.GRAPHQL_HOST}:${process.env.GRAPHQL_PORT}${process.env.GRAPHQL_SUBSCRIPTION_ENDPOINT}`);
  });

})();