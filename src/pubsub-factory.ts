import { ServerError } from '@via-profit-services/core';
import { PubsubFactory, IdentiveWebSocketClient } from '@via-profit-services/subscriptions';
import { execute, subscribe } from 'graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import IORedis from 'ioredis';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

type Cache = ReturnType<PubsubFactory>;

const cache: Cache = {
  pubsub: null,
  subscriptionServer: null,
  pubsubClients: new Map<string, IdentiveWebSocketClient>(),
}

const pubsubFactory: PubsubFactory = ({ configuration, logger, schema, context }) => {

  if (cache.pubsub && cache.subscriptionServer) {
    return cache;
  }

  let redisPublisherHandle: IORedis.Redis;
  let redisSubscriberHandle: IORedis.Redis;
  const { server, endpoint } = configuration;
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


  cache.pubsub = cache.pubsub ?? new RedisPubSub({
    publisher: redisPublisherHandle,
    subscriber: redisSubscriberHandle,
    connection: redisConfig,
  });

  
  cache.subscriptionServer = cache.subscriptionServer ?? new SubscriptionServer({
    execute,
    schema,
    subscribe,
    onConnect: async (_connectionParams: any, webSocket: IdentiveWebSocketClient) => {
      const connectionClientID = uuidv4();
      webSocket.__connectionClientID = connectionClientID;
      cache.pubsubClients.set(connectionClientID, webSocket);

      logger.server.debug(`New subscription client connected with ID ${connectionClientID}. Active connections: ${cache.pubsubClients.size}`);
      context.emitter.emit('subscriptions-client-connected', webSocket, cache.pubsubClients);

      return context;
    },
    onDisconnect: (webSocket: IdentiveWebSocketClient) => {
      const connectionClientID = webSocket.__connectionClientID;
      cache.pubsubClients.delete(connectionClientID);

      logger.server.debug(`Subscription client disconnected with ID ${connectionClientID}. Active connections: ${cache.pubsubClients.size}`);
      context.emitter.emit('subscriptions-client-disconnected', webSocket, cache.pubsubClients);

      webSocket.close();
    },
  },
  {
    server,
    path: endpoint,
  });

  return cache;
}

export default pubsubFactory;
