import { FolderRepository } from '../domain/folder.repository';
import { Folder, FolderWithChildren, SearchResults } from '@packages/shared-types';

export class FolderService {
  constructor(private folderRepo: FolderRepository) {}

  async getRootFolders(): Promise<Folder[]> {
    return this.folderRepo.getRootFolders();
  }

  async getFolderChildren(folderId: string): Promise<FolderWithChildren> {
    const result = await this.folderRepo.getFolderWithChildren(folderId);
    if (!result) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }
    return result;
  }

  async search(query: string): Promise<SearchResults> {
    if (!query || query.trim() === '') {
      return { folders: [], files: [] };
    }
    return this.folderRepo.search(query);
  }
}
