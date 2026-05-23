import { FolderService } from '../application/folder.service';
import { APIResponse, Folder, FolderWithChildren, SearchResults } from '@packages/shared-types';

export class ExplorerController {
  constructor(private folderService: FolderService) {}

  async getRootFolders(): Promise<APIResponse<Folder[]>> {
    try {
      const folders = await this.folderService.getRootFolders();
      return { success: true, data: folders };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'GET_ROOT_FOLDERS_FAILED',
          message: error.message || 'Failed to fetch root folders'
        }
      };
    }
  }

  async getFolderChildren(folderId: string): Promise<APIResponse<FolderWithChildren>> {
    try {
      const data = await this.folderService.getFolderChildren(folderId);
      return { success: true, data };
    } catch (error: any) {
      const isNotFound = error.message && error.message.includes('not found');
      return {
        success: false,
        error: {
          code: isNotFound ? 'FOLDER_NOT_FOUND' : 'GET_CHILDREN_FAILED',
          message: error.message || 'Failed to fetch folder children'
        }
      };
    }
  }

  async search(query: string): Promise<APIResponse<SearchResults>> {
    try {
      const results = await this.folderService.search(query);
      return { success: true, data: results };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: error.message || 'Search execution failed'
        }
      };
    }
  }
}
