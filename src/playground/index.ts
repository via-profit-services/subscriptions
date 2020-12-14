import { makeExecutableSchema } from '@graphql-tools/schema';
import viaProfitServerFactory, { resolvers, typeDefs } from '@via-profit-services/core';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

import subscriptionMiddlewareFactory, { resolvers as subResolvers, typeDefs as subTypes } from '../index';

const PORT = 9005;
const LOG_DIR = './artifacts/log';
const app = express();
const server = createServer(app);
const schema = makeExecutableSchema({
  typeDefs: [typeDefs, subTypes],
  resolvers: [resolvers, subResolvers],
});

const subscriptionMiddleware = subscriptionMiddlewareFactory({
  server,
  schema,
  endpoint: '/graphql',
  redis: {
    port: 6379,
    host: 'localhost',
    password: '',
  },
});

const { viaProfitGraphql } = viaProfitServerFactory({
  server,
  schema,
  debug: true,
  enableIntrospection: true,
  logDir: LOG_DIR,
  middleware: [subscriptionMiddleware],
});


app.use(cors());
app.set('trust proxy', true);
app.use('/graphql', viaProfitGraphql);


server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`GraphQL server started at http://localhost:${PORT}/graphql`);
  // eslint-disable-next-line no-console
  console.log(`GraphQL server started at ws://localhost:${PORT}/graphql`);
});
