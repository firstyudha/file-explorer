import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useExplorerStore } from '../src/stores/explorer';
import { explorerApi } from '../src/api/explorer.api';

// Mock the API client
vi.mock('../src/api/explorer.api', () => {
  return {
    explorerApi: {
      getRootFolders: vi.fn(),
      getFolderChildren: vi.fn(),
      search: vi.fn(),
    },
    default: {
      getRootFolders: vi.fn(),
      getFolderChildren: vi.fn(),
      search: vi.fn(),
    }
  };
});

describe('Explorer Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchRootFolders should fetch and populate root folders', async () => {
    const mockRootFolders = [
      { id: '1', name: 'Documents', parentId: null, createdAt: new Date() },
      { id: '2', name: 'Pictures', parentId: null, createdAt: new Date() }
    ];
    vi.mocked(explorerApi.getRootFolders).mockResolvedValue(mockRootFolders);

    const store = useExplorerStore();
    expect(store.rootFolders).toEqual([]);
    expect(store.loading).toBe(false);

    await store.fetchRootFolders();

    expect(explorerApi.getRootFolders).toHaveBeenCalledTimes(1);
    expect(store.rootFolders).toEqual(mockRootFolders);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('loadFolder on Cache-Miss should fetch folder children from API and cache them', async () => {
    const folderId = '123-uuid';
    const mockFolderData = {
      id: folderId,
      name: 'Documents',
      parentId: null,
      createdAt: new Date(),
      children: [{ id: 'child-1', name: 'Resume', parentId: folderId, createdAt: new Date() }],
      files: [{ id: 'file-1', folderId, name: 'notes.txt', size: '1024', extension: 'txt', createdAt: new Date() }]
    };

    vi.mocked(explorerApi.getFolderChildren).mockResolvedValue(mockFolderData);

    const store = useExplorerStore();
    expect(store.explorerCache[folderId]).toBeUndefined();

    await store.loadFolder(folderId);

    expect(explorerApi.getFolderChildren).toHaveBeenCalledWith(folderId);
    expect(explorerApi.getFolderChildren).toHaveBeenCalledTimes(1);
    expect(store.currentFolder).toEqual(mockFolderData);
    expect(store.explorerCache[folderId]).toEqual(mockFolderData);
    expect(store.expandedFolderIds[folderId]).toBe(true);
  });

  it('loadFolder on Cache-Hit should load from cache instantly and NOT query the API again', async () => {
    const folderId = 'cached-uuid';
    const mockCachedData = {
      id: folderId,
      name: 'Cached Folder',
      parentId: null,
      createdAt: new Date(),
      children: [],
      files: []
    };

    const store = useExplorerStore();
    // Pre-populate the cache
    store.explorerCache[folderId] = mockCachedData;

    await store.loadFolder(folderId);

    // API should NOT have been called because it is a Cache-Hit
    expect(explorerApi.getFolderChildren).not.toHaveBeenCalled();
    expect(store.currentFolder).toEqual(mockCachedData);
    expect(store.expandedFolderIds[folderId]).toBe(true);
  });

  it('executeSearch should trigger search query and populate searchResults', async () => {
    const query = 'SECRET';
    const mockSearchResults = {
      folders: [],
      files: [{ id: 'secret-file', folderId: 'folder-9', name: 'SECRET_GOLD_RESERVES.xlsx', size: '999999999', extension: 'xlsx', createdAt: new Date() }]
    };

    vi.mocked(explorerApi.search).mockResolvedValue(mockSearchResults);

    const store = useExplorerStore();
    expect(store.isSearching).toBe(false);

    await store.executeSearch(query);

    expect(explorerApi.search).toHaveBeenCalledWith(query);
    expect(explorerApi.search).toHaveBeenCalledTimes(1);
    expect(store.isSearching).toBe(true);
    expect(store.searchResults).toEqual(mockSearchResults);
  });

  it('clearSearch should reset search state variables', async () => {
    const store = useExplorerStore();
    store.isSearching = true;
    store.searchQuery = 'something';
    store.searchResults = { folders: [{} as any], files: [{} as any] };

    store.clearSearch();

    expect(store.isSearching).toBe(false);
    expect(store.searchQuery).toBe('');
    expect(store.searchResults).toEqual({ folders: [], files: [] });
  });
});
