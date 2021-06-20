import { ServerError, Context } from '@via-profit-services/core';
import { PubsubFactory } from '@via-profit-services/subscriptions';
import { execute, subscribe } from 'graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import IORedis from 'ioredis';
import ws from 'ws';

type Cache = ReturnType<PubsubFactory>;

const cache: Cache = {
  pubsub: null,
  subscriptionServer: null,
};

const pubsubFactory: PubsubFactory = ({ configuration, logger, schema, context }) => {

  if (cache.pubsub && cache.subscriptionServer) {
    return cache;
  }

  let redisPublisherHandle: IORedis.Redis;
  let redisSubscriberHandle: IORedis.Redis;
  const {
    server,
    endpoint,
    onConnect,
    onDisconnect,
    onClose,
    onSubscribe,
    onOperation,
    onError,
    onNext,
    onComplete,
  } = configuration;

  const redisConfig = {
    retryStrategy: (times: number) => Math.min(times * 50, 20000),
    ...configuration.redis,
  };

  try {
    redisPublisherHandle = new IORedis(redisConfig);
    redisSubscriberHandle = new IORedis(redisConfig);
  } catch (err) {
    throw new ServerError('Failed to init Redis handle', { err });
  }

  redisPublisherHandle.on('error', (err) => {
    logger.server.error(`Redis Publisher error ${err.errno}`, { err });
  });

  redisSubscriberHandle.on('error', (err) => {
    logger.server.error(`Redis Subscriber error ${err.errno}`, { err });
  });

  redisPublisherHandle.on('connect', () => {
    logger.server.debug('Redis Publisher connection is Done');
  });

  redisSubscriberHandle.on('connect', () => {
    logger.server.debug('Redis Subscriber connection is Done');
  });

  redisPublisherHandle.on('reconnecting', () => {
    logger.server.debug('Redis Publisher reconnecting');
  });

  redisSubscriberHandle.on('reconnecting', () => {
    logger.server.debug('Redis Subscriber reconnecting');
  });

  redisPublisherHandle.on('close', () => {
    logger.server.debug('Redis Publisher close');
  });

  redisSubscriberHandle.on('close', () => {
    logger.server.debug('Redis Subscriber close');
  });


  cache.pubsub = new RedisPubSub({
    publisher: redisPublisherHandle,
    subscriber: redisSubscriberHandle,
    connection: redisConfig,
  });


  cache.subscriptionServer = new ws.Server({
    path: endpoint,
    server,
  });

  useServer<{ context?: Context; }>(
    {
      execute,
      subscribe,
      schema,
      onConnect: ctx => {
        ctx.extra.context = context;
        if (onConnect) {
          onConnect(ctx);
        }

        return true;
      },
      context: ctx => ctx.extra.context,
      onDisconnect,
      onClose,
      onSubscribe,
      onOperation,
      onError,
      onNext,
      onComplete,
    },
    cache.subscriptionServer,
  );

  return cache;
}

export default pubsubFactory;
