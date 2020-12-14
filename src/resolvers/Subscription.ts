import type { Context } from '@via-profit-services/core';

const Subscription = {
  echo: {
    subscribe: (_parent: any, _args: any, context: Context) => context.pubsub.asyncIterator('echo'),
  },
};

export default Subscription;