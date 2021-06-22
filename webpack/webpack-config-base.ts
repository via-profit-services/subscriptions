import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.graphql$/,
        use: 'raw-loader',
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json', '.graphql', '.html'],
  },
  externals: [
    /^winston(|-daily-rotate-file)$/,
    /^moment(|-timezone)$/,
    /^graphql(|-tools|\/.+)$/,
    /^supports-color$/,
    /^graphql-ws/,
    /^graphql-redis-subscriptions$/,
    /^graphql-subscriptions$/,
    /^ioredis$/,
    /^utf-8-validate$/,
    /^ws$/,
    /^bufferutil$/,
    /^express$/,
    /^@via-profit-services\/core/,
  ],
};

export default webpackBaseConfig;
