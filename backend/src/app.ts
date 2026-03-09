import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import taskRoutes from './routes/task.routes';
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/error.middleware';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
const swaggerDocument = YAML.load(
  path.join(__dirname, 'docs/openapi.yaml')
) as Record<string, unknown>;

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'HMCTS Task Manager API',
    customCss: '.swagger-ui .topbar { background-color: #1d2d5a; }',
  })
);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'HMCTS Task Manager API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ─── Error Handlers (must be last) ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3001', 10);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🏛  HMCTS Task Manager API`);
    console.log(`   ➜  Server:  http://localhost:${PORT}`);
    console.log(`   ➜  Docs:    http://localhost:${PORT}/api/docs`);
    console.log(`   ➜  Health:  http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
