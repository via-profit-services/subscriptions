// Type definitions for @via-profit-services/subscriptions
// Project: git@github.com:via-profit-services/subscriptions
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

/// <reference types="node" />
declare module '@via-profit-services/core' {
  import { RedisPubSub } from 'graphql-redis-subscriptions';
  import { Redis } from 'ioredis';

  interface Context {

    /**
     * Already configured instance of Redis PubSub
     * @see: https://github.com/davidyaha/graphql-redis-subscriptions
     */
    pubsub: RedisPubSub;

    /**
     * Already configures instance of ioRedis
     * @see: https://github.com/luin/ioredis
     */
    redis: Redis;
  }
  
}

declare module '@via-profit-services/subscriptions' {
  import { LoggersCollection, Middleware, Context } from '@via-profit-services/core';
  import { RedisPubSub } from 'graphql-redis-subscriptions';
  import { RedisOptions, Redis } from 'ioredis';
  import { GraphQLSchema } from 'graphql';
  import http from 'http';

  export interface InitialProps {
    schema: GraphQLSchema;
    /**
     * Your HTTP server instance
     */
    server: http.Server;

    /**
     * Subscriptions endpoint \
     * \
     * Default: `/subscriptions`
     */
    endpoint?: string;
    /**
     * Redis configuration
     * @see: https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
     * \
     * Default: \
     * `host: "localhost"`\
     * `port: 6379`\
     * `password: ""`
     */
    redis?: RedisOptions;
  }

  export type Configuration = Required<InitialProps>;

  export type SubscriptionsMiddlewareFactory = (config: InitialProps) => Middleware;

  export type PubsubFactory = (config: RedisOptions, logger: LoggersCollection) => {
    pubsub: RedisPubSub;
    redis: Redis;
  }
  
  export type SubscriptionsFactory = (props: {
    schema: GraphQLSchema;
    server: http.Server;
    endpoint: string;
    context: Context;
  }) => void;

  export const resolvers: any;
  export const typeDefs: string;

}