import { IObjectTypeResolver } from '@graphql-tools/utils';
import { Context } from '@via-profit-services/core';

interface Args {
  str: string;
}

const Mutation: IObjectTypeResolver<any, Context, Args> = {
  echo: (_parent, args, context) => {
    const { pubsub } = context;
    const { str } = args;

    pubsub.publish('echo', { echo: str });

    return str;
  },
};

export default Mutation;