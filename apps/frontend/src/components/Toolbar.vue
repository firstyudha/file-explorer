<template>
  <div class="p-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between space-x-3 select-none">
    <!-- Navigation Buttons -->
    <div class="flex items-center space-x-1">
      <!-- Back -->
      <button 
        class="p-1.5 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent"
        :disabled="!canGoBack"
        @click="goBack"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <!-- Up (to Parent Folder) -->
      <button 
        class="p-1.5 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent"
        :disabled="!store.currentFolder?.parentId"
        @click="goUp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        </svg>
      </button>

      <!-- Refresh -->
      <button 
        class="p-1.5 rounded hover:bg-neutral-800 transition-all active:scale-95"
        @click="refresh"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-white" :class="{ 'animate-spin': store.loading }">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    </div>

    <!-- Active Breadcrumbs Navigation -->
    <Breadcrumbs />

    <!-- Debounced Search Input Bar -->
    <div class="relative w-72">
      <input 
        v-model="inputQuery"
        type="text"
        placeholder="Cari berkas atau folder..."
        class="w-full bg-neutral-900 border border-neutral-800 focus:border-explorer-accent text-xs text-gray-200 rounded px-3 py-1.5 pl-8 focus:outline-none transition-colors"
        @input="onSearchInput"
      />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 absolute left-2.5 top-2 text-neutral-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
      </svg>
      <button 
        v-if="inputQuery"
        class="absolute right-2.5 top-1.5 text-neutral-400 hover:text-white"
        @click="clearQuery"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExplorerStore } from '../stores/explorer';
import Breadcrumbs from './Breadcrumbs.vue';

const store = useExplorerStore();
const router = useRouter();

const inputQuery = ref('');
const canGoBack = ref(false);
let searchTimeout: any = null;

// Lacak history navigasi
watch(
  () => router.currentRoute.value.path,
  () => {
    canGoBack.value = window.history.state && window.history.state.back;
  }
);

function goBack() {
  router.back();
}

function goUp() {
  const parentId = store.currentFolder?.parentId;
  if (parentId) {
    router.push(`/folder/${parentId}`);
  } else {
    router.push('/folder');
  }
}

function refresh() {
  const currentId = store.currentFolderId;
  store.invalidateCache(currentId || undefined);
  store.loadFolder(currentId);
}

// Debounce search input logic
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    store.executeSearch(inputQuery.value);
  }, 300);
}

function clearQuery() {
  inputQuery.value = '';
  store.clearSearch();
}

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>
