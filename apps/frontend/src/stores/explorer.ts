import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Folder, FolderWithChildren, SearchResults } from '@packages/shared-types';
import { explorerApi } from '../api/explorer.api';

export const useExplorerStore = defineStore('explorer', () => {
  // State
  const rootFolders = ref<Folder[]>([]);
  const currentFolderId = ref<string | null>(null);
  const currentFolder = ref<FolderWithChildren | null>(null);
  const searchResults = ref<SearchResults>({ folders: [], files: [] });
  const isSearching = ref(false);
  const searchQuery = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Expanded folders in sidebar tracker
  const expandedFolderIds = ref<Record<string, boolean>>({});

  // Client-side cache to avoid redundant API queries
  const explorerCache = ref<Record<string, FolderWithChildren>>({});

  // Actions
  async function fetchRootFolders() {
    loading.value = true;
    error.value = null;
    try {
      rootFolders.value = await explorerApi.getRootFolders();
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat folder root';
    } finally {
      loading.value = false;
    }
  }

  async function loadFolder(id: string | null) {
    currentFolderId.value = id;
    if (!id) {
      currentFolder.value = null;
      return;
    }

    // 1. Cache-Hit
    if (explorerCache.value[id]) {
      currentFolder.value = explorerCache.value[id];
      expandedFolderIds.value[id] = true;
      return;
    }

    // 2. Cache-Miss
    loading.value = true;
    error.value = null;
    try {
      const data = await explorerApi.getFolderChildren(id);
      explorerCache.value[id] = data; // Cache the loaded children
      currentFolder.value = data;
      expandedFolderIds.value[id] = true;
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat isi folder';
    } finally {
      loading.value = false;
    }
  }

  function toggleFolderExpand(id: string) {
    if (expandedFolderIds.value[id]) {
      expandedFolderIds.value[id] = false;
    } else {
      expandedFolderIds.value[id] = true;
      // Fetch child folder if not already cached (sidebar lazy load support)
      if (!explorerCache.value[id]) {
        loadFolder(id);
      }
    }
  }

  async function executeSearch(query: string) {
    searchQuery.value = query;
    if (!query || query.trim() === '') {
      isSearching.value = false;
      searchResults.value = { folders: [], files: [] };
      return;
    }

    loading.value = true;
    isSearching.value = true;
    error.value = null;
    try {
      searchResults.value = await explorerApi.search(query);
    } catch (err: any) {
      error.value = err.message || 'Pencarian gagal dilakukan';
    } finally {
      loading.value = false;
    }
  }

  function clearSearch() {
    searchQuery.value = '';
    isSearching.value = false;
    searchResults.value = { folders: [], files: [] };
  }

  function invalidateCache(id?: string) {
    if (id) {
      delete explorerCache.value[id];
    } else {
      explorerCache.value = {};
    }
  }

  return {
    rootFolders,
    currentFolderId,
    currentFolder,
    searchResults,
    isSearching,
    searchQuery,
    loading,
    error,
    expandedFolderIds,
    explorerCache,
    fetchRootFolders,
    loadFolder,
    toggleFolderExpand,
    executeSearch,
    clearSearch,
    invalidateCache
  };
});
