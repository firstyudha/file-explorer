import { Elysia, t } from 'elysia';
import { PrismaFolderRepository } from '../infrastructure/prisma-folder.repository';
import { FolderService } from '../application/folder.service';
import { ExplorerController } from './explorer.controller';

const folderRepo = new PrismaFolderRepository();
const folderService = new FolderService(folderRepo);
const controller = new ExplorerController(folderService);

export const explorerRoutes = new Elysia({ prefix: '/api/v1' })
  .get('/folders/root', () => controller.getRootFolders())
  .get('/folders/:id/children', ({ params: { id } }) => controller.getFolderChildren(id), {
    params: t.Object({
      id: t.String({ format: 'uuid', error: 'Invalid folder ID format (must be UUID)' })
    })
  })
  .get('/folders/search', ({ query: { q } }) => controller.search(q || ''), {
    query: t.Object({
      q: t.Optional(t.String())
    })
  });
