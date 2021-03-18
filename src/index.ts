import { Middleware } from '@via-profit-services/core';
import { SubscriptionsMiddlewareFactory, Configuration } from '@via-profit-services/subscriptions';
import { withFilter as pubsubFilter } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';


import {
  DEFAULT_ENDPOINT, DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PASSWORD, DEFAULT_REDIS_PORT,
} from './constants';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';
import pubsubFactory from './pubsub-factory';

const factory: SubscriptionsMiddlewareFactory = (config) => {

  const configuration: Configuration = {
    endpoint: DEFAULT_ENDPOINT,
    ...config,
    redis: {
      port: DEFAULT_REDIS_PORT,
      host: DEFAULT_REDIS_HOST,
      password: DEFAULT_REDIS_PASSWORD,
      ...config.redis,
    },
  };

  const middleware: Middleware = ({ context, schema }) => {
    const { logger } = context;
    const { pubsub, pubsubClients } = pubsubFactory({
      configuration,
      context,
      schema,
      logger
    });

    context.pubsubClients = context.pubsubClients ?? pubsubClients;
    context.pubsub = context.pubsub ?? pubsub;
    
    return {
      context,
    };
  };

  return middleware;
}

export {
  resolvers,
  typeDefs,
  factory,
  pubsubFilter,
}
