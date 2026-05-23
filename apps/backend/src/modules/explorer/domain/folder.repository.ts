import { Folder, FolderWithChildren, SearchResults } from '@packages/shared-types';

export interface FolderRepository {
  getRootFolders(): Promise<Folder[]>;
  getFolderWithChildren(folderId: string): Promise<FolderWithChildren | null>;
  search(query: string): Promise<SearchResults>;
}
