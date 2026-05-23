import { prisma } from '../../../config/database';
import { FolderRepository } from '../domain/folder.repository';
import { Folder, File, FolderWithChildren, SearchResults } from '@packages/shared-types';

export class PrismaFolderRepository implements FolderRepository {
  private mapFile(dbFile: any): File {
    return {
      id: dbFile.id,
      folderId: dbFile.folderId,
      name: dbFile.name,
      size: dbFile.size.toString(),
      extension: dbFile.extension,
      createdAt: dbFile.createdAt
    };
  }

  async getRootFolders(): Promise<Folder[]> {
    const dbFolders = await prisma.folder.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' }
    });

    return dbFolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt
    }));
  }

  async getFolderWithChildren(folderId: string): Promise<FolderWithChildren | null> {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        children: { orderBy: { name: 'asc' } },
        files: { orderBy: { name: 'asc' } }
      }
    });

    if (!folder) return null;

    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt,
      children: folder.children.map(child => ({
        id: child.id,
        name: child.name,
        parentId: child.parentId,
        createdAt: child.createdAt
      })),
      files: folder.files.map(file => this.mapFile(file))
    };
  }

  async search(query: string): Promise<SearchResults> {
    const dbFolders = await prisma.folder.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 100
    });

    const dbFiles = await prisma.file.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 100
    });

    return {
      folders: dbFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        createdAt: folder.createdAt
      })),
      files: dbFiles.map(file => this.mapFile(file))
    };
  }
}
