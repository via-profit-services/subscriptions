import { Middleware, Context } from '@via-profit-services/core';
import { SubscriptionsMiddlewareFactory, Configuration } from '@via-profit-services/subscriptions';

import {
  DEFAULT_ENDPOINT, DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PASSWORD, DEFAULT_REDIS_PORT,
} from './constants';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';
import { pubsubFactory, subscriptionsFactory } from './subscriptions';

const subscriptionMiddlewareFactory: SubscriptionsMiddlewareFactory = (config) => {
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

  const middleware: Middleware = (props) => {
    const { context } = props;
    const { schema, endpoint, server } = configuration;
    const { logger } = context;
    const { pubsub, redis } = pubsubFactory(configuration.redis, logger);
    const composedContext: Context = {
      ...context,
      pubsub,
      redis,
    }

    subscriptionsFactory({
      schema,
      endpoint,
      server,
      context: composedContext,
    });


    return {
      context: composedContext,
    }
  };

  return middleware;
}

export {
  resolvers,
  typeDefs,
}

export default subscriptionMiddlewareFactory;
