import 'dotenv/config';
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import './utils/response/customSuccess';
import './utils/ormconfig';
import routes from './routes';
import { errorHandler } from './utils/errorHandler';

const app = express();
app.use(
  cors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  }),
);
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Allow', 'GET,PUT,POST,DELETE,PATCH,UPDATE');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,UPDATE');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization, Cache-Control',
  );
  next();
});

try {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), {
    flags: 'a',
  });
  app.use(morgan('combined', { stream: accessLogStream }));
} catch (err) {
  console.log(err);
}
app.use(morgan('combined'));
app.get('/', (req, res) => {
  res.send({
    code: 200,
    message: 'Server running....',
  });
});
app.use('/', routes);
app.use('*', (req, res) => {
  res.status(404).send({
    message: `Requested path not found`,
  });
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
