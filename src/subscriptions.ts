import { ServerError } from '@via-profit-services/core';
import { PubsubFactory, SubscriptionsFactory } from '@via-profit-services/subscriptions';
import { execute, subscribe } from 'graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import IORedis from 'ioredis';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import WebSocket from 'ws';


export const pubsubFactory: PubsubFactory = (config, logger) => {

  let redisHandle: IORedis.Redis;
  let redisPublisherHandle: IORedis.Redis;
  let redisSubscriberHandle: IORedis.Redis;

  const redisConfig = {
    retryStrategy: (times: number) => Math.min(times * 50, 20000),
    ...config,
  };

  try {
    redisHandle = new IORedis(redisConfig);
    redisPublisherHandle = new IORedis(redisConfig);
    redisSubscriberHandle = new IORedis(redisConfig);
  } catch (err) {
    throw new ServerError('Failed to init Redis handle', { err });
  }

  redisHandle.on('error', (err) => {
    logger.server.error(`Redis Common error ${err.errno}`, { err });
  });

  redisPublisherHandle.on('error', (err) => {
    logger.server.error(`Redis Publisher error ${err.errno}`, { err });
  });

  redisSubscriberHandle.on('error', (err) => {
    logger.server.error(`Redis Subscriber error ${err.errno}`, { err });
  });

  redisHandle.on('connect', () => {
    logger.server.debug('Redis common connection is Done');
  });

  redisPublisherHandle.on('connect', () => {
    logger.server.debug('Redis Publisher connection is Done');
  });

  redisSubscriberHandle.on('connect', () => {
    logger.server.debug('Redis Subscriber connection is Done');
  });

  redisHandle.on('reconnecting', () => {
    logger.server.debug('Redis common reconnecting');
  });

  redisPublisherHandle.on('reconnecting', () => {
    logger.server.debug('Redis Publisher reconnecting');
  });

  redisSubscriberHandle.on('reconnecting', () => {
    logger.server.debug('Redis Subscriber reconnecting');
  });

  redisHandle.on('close', () => {
    logger.server.debug('Redis common close');
  });

  redisPublisherHandle.on('close', () => {
    logger.server.debug('Redis Publisher close');
  });

  redisSubscriberHandle.on('close', () => {
    logger.server.debug('Redis Subscriber close');
  });


  const pubsub = new RedisPubSub({
    publisher: redisPublisherHandle,
    subscriber: redisSubscriberHandle,
    connection: config,
  });

  return {
    redis: redisHandle,
    pubsub,
  };
}

export const subscriptionsFactory: SubscriptionsFactory = (props) => {
  const { context, schema, endpoint, server } = props;
  const { logger } = context;


  const subscriptionServer = new SubscriptionServer({
    execute,
    schema,
    subscribe,
    onConnect: async () => {
      // if (debug) {
        logger.server.debug('New subscription client connected');
      // }

      return context;
    },
    onDisconnect: (webSocket: WebSocket) => webSocket.close(),
  },
  {
    server,
    path: endpoint,
  });

  return subscriptionServer;
}
