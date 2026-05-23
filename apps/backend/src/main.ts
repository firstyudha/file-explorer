import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { explorerRoutes } from './modules/explorer/interfaces/explorer.routes';

const app = new Elysia()
  .use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(swagger({
    path: '/api/swagger',
    specPath: '/api/swagger/json',
    scalarConfig: {
      spec: {
        url: '/api/swagger/json'
      }
    },
    documentation: {
      info: {
        title: '📂 File Explorer API Docs',
        version: '1.0.0',
        description: 'Interactive API documentation for the File Explorer clone'
      }
    }
  }))
  .get('/', () => 'File Explorer Backend is running')
  .use(explorerRoutes)
  .onError(({ code, error, set }) => {
    console.error(`Error: [${code}] - ${error.message}`);

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: error.message || 'Request validation failed'
        }
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message || 'Route not found'
        }
      };
    }

    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected error occurred'
      }
    };
  })
  .listen(process.env.PORT || 3000);

console.log(`Backend server started on port ${app.server?.port}`);
