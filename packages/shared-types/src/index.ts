export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date | string;
}

export interface File {
  id: string;
  folderId: string;
  name: string;
  size: string; // Handled as string (or number conversion) to avoid BigInt serialization errors
  extension: string;
  createdAt: Date | string;
}

export interface FolderWithChildren extends Folder {
  children: Folder[];
  files: File[];
}

export interface SearchResults {
  folders: Folder[];
  files: File[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
