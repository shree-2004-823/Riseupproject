import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRouter);

if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../client');
  app.use(express.static(clientDistPath));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
