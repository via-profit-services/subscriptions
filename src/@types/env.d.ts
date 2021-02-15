declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    ANALYZE?: 'true';
    DEBUG?: 'true';
    
    GRAPHQL_HOST: string;
    GRAPHQL_PORT: string;
    REDIS_PORT: string;
    REDIS_HOST: string;
    GRAPHQL_ENDPOINT: string;
    GRAPHQL_SUBSCRIPTION_ENDPOINT: string;

  }
}