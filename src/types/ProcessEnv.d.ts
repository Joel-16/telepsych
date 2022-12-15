declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    API_SECRET: string;
    API_KEY: string;
    CLOUD_NAME: string;
  }
}
