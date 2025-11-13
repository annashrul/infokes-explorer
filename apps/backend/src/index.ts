import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { testConnection } from '@/infrastructure/database';
import { FolderRepository } from '@/infrastructure/FolderRepository';
import { FolderService } from '@/application/FolderService';
import { FolderController } from '@/presentation/FolderController';

const PORT = process.env.PORT || 3000;

// Dependency Injection
const folderRepository = new FolderRepository();
const folderService = new FolderService(folderRepository);
const folderController = new FolderController(folderService);

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use((app) => folderController.routes(app))
  .use((app) => folderController.fileRoutes(app))
  .onError(({ code, error, set }) => {
    console.error('Error:', error);
    set.status = code === 'NOT_FOUND' ? 404 : 500;
    return {
      success: false,
      error: error.message || 'Internal server error'
    };
  })
  .listen(PORT);

// Test database connection
await testConnection();

console.log(`🚀 Backend server running at http://localhost:${PORT}`);
