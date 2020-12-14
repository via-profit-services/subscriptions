import { IResolvers } from '@graphql-tools/utils';

import Mutation from './Mutation';
import Subscription from './Subscription';

const resolvers: IResolvers = {
  Mutation,
  Subscription,
}

export default resolvers;
