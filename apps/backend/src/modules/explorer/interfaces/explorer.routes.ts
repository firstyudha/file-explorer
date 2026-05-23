import { Elysia, t } from 'elysia';
import { PrismaFolderRepository } from '../infrastructure/prisma-folder.repository';
import { FolderService } from '../application/folder.service';
import { ExplorerController } from './explorer.controller';

const folderRepo = new PrismaFolderRepository();
const folderService = new FolderService(folderRepo);
const controller = new ExplorerController(folderService);

export const explorerRoutes = new Elysia({ prefix: '/api/v1' })
  .get('/folders/root', () => controller.getRootFolders(), {
    detail: {
      tags: ['Explorer'],
      summary: 'Get Root Folders',
      description: 'Retrieve all top-level (root) folders in the file explorer.'
    }
  })
  .get('/folders/:id/children', ({ params: { id } }) => controller.getFolderChildren(id), {
    params: t.Object({
      id: t.String({ format: 'uuid', error: 'Invalid folder ID format (must be UUID)' })
    }),
    detail: {
      tags: ['Explorer'],
      summary: 'Get Folder Children',
      description: 'Retrieve all sub-folders and items contained inside the folder with the specified UUID.'
    }
  })
  .get('/folders/search', ({ query: { q } }) => controller.search(q || ''), {
    query: t.Object({
      q: t.Optional(t.String())
    }),
    detail: {
      tags: ['Explorer'],
      summary: 'Search Folders',
      description: 'Search for folders matching the given search query string.'
    }
  });
