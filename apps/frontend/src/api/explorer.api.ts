import axios from 'axios';
import { APIResponse, Folder, FolderWithChildren, SearchResults } from '@packages/shared-types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const explorerApi = {
  async getRootFolders(): Promise<Folder[]> {
    const response = await api.get<APIResponse<Folder[]>>('/folders/root');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch root folders');
    }
    return response.data.data;
  },

  async getFolderChildren(id: string): Promise<FolderWithChildren> {
    const response = await api.get<APIResponse<FolderWithChildren>>(`/folders/${id}/children`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch folder children');
    }
    return response.data.data;
  },

  async search(query: string): Promise<SearchResults> {
    const response = await api.get<APIResponse<SearchResults>>(`/folders/search`, {
      params: { q: query }
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Search failed');
    }
    return response.data.data;
  }
};
export default explorerApi;
