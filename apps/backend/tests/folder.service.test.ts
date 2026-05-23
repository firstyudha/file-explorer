import { describe, it, expect, vi } from 'vitest';
import { FolderService } from '../src/modules/explorer/application/folder.service';
import { FolderRepository } from '../src/modules/explorer/domain/folder.repository';
import { Folder, FolderWithChildren, SearchResults } from '@packages/shared-types';

describe('FolderService', () => {
  const mockFolder: Folder = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Documents',
    parentId: null,
    createdAt: new Date().toISOString()
  };

  const mockFolderWithChildren: FolderWithChildren = {
    ...mockFolder,
    children: [],
    files: []
  };

  const mockSearchResults: SearchResults = {
    folders: [mockFolder],
    files: []
  };

  const mockRepository = {
    getRootFolders: vi.fn().mockResolvedValue([mockFolder]),
    getFolderWithChildren: vi.fn().mockImplementation((id: string) => {
      if (id === mockFolder.id) return Promise.resolve(mockFolderWithChildren);
      return Promise.resolve(null);
    }),
    search: vi.fn().mockResolvedValue(mockSearchResults)
  } as unknown as FolderRepository;

  const service = new FolderService(mockRepository);

  it('should fetch root folders correctly', async () => {
    const result = await service.getRootFolders();
    expect(result).toEqual([mockFolder]);
    expect(mockRepository.getRootFolders).toHaveBeenCalled();
  });

  it('should fetch folder children if folder exists', async () => {
    const result = await service.getFolderChildren(mockFolder.id);
    expect(result).toEqual(mockFolderWithChildren);
    expect(mockRepository.getFolderWithChildren).toHaveBeenCalledWith(mockFolder.id);
  });

  it('should throw error if folder does not exist', async () => {
    await expect(service.getFolderChildren('invalid-id')).rejects.toThrow('Folder with ID invalid-id not found');
  });

  it('should search for folders/files', async () => {
    const result = await service.search('Doc');
    expect(result).toEqual(mockSearchResults);
    expect(mockRepository.search).toHaveBeenCalledWith('Doc');
  });

  it('should return empty results for empty search query', async () => {
    const result = await service.search('  ');
    expect(result).toEqual({ folders: [], files: [] });
  });
});
