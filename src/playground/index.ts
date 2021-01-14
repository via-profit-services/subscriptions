import { makeExecutableSchema } from '@graphql-tools/schema';
import * as core from '@via-profit-services/core';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import * as subscriptions from '../index';

const PORT = 9005;
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
    endpoint: '/graphql',
    redis: {
      port: 6379,
      host: 'localhost',
      password: '',
    },
  });

  const { graphQLExpress } = await core.factory({
    server,
    schema,
    debug: true,
    logDir: LOG_DIR,
    middleware: [subscriptionMiddleware],
  });


  app.use(cors());
  app.set('trust proxy', true);
  app.use('/graphql', graphQLExpress);


  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`GraphQL server started at http://localhost:${PORT}/graphql`);
    // eslint-disable-next-line no-console
    console.log(`GraphQL server started at ws://localhost:${PORT}/graphql`);
  });

})();