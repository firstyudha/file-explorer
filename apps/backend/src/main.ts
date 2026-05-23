import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { explorerRoutes } from './modules/explorer/interfaces/explorer.routes';

const app = new Elysia()
  .use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
