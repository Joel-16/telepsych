import { DataSource } from 'typeorm';
const ssl = {
  rejectUnauthorized: false,
};

const ent = process.env.NODE_ENV === 'production' ? ['dist/**/entities/*.entity{.ts,.js}'] : ['src/**/entities/*.entity{.ts,.js}'];

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:5432@localhost:5432/telepsy',
  entities: ent,
  synchronize: true,
  ssl: process.env.NODE_ENV === 'production' && ssl,
});

AppDataSource.initialize()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error(err));
