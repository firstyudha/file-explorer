<template>
  <div class="flex flex-col h-screen w-screen bg-explorer-bg text-gray-200">
    <!-- 1. Toolbar & Search & Breadcrumbs -->
    <Toolbar />
    
    <div class="flex flex-1 overflow-hidden">
      <!-- 2. Left Directory Sidebar -->
      <div class="w-64 bg-explorer-sidebar border-r border-neutral-800 p-4 flex flex-col">
        <p class="text-[10px] uppercase text-neutral-500 font-bold tracking-wider mb-3">Quick Access</p>
        <FolderTree class="flex-1" />
      </div>
      
      <!-- 3. Right File List Grid Panel -->
      <div class="flex-1 p-6 overflow-y-auto bg-[#191919]">
        <div v-if="store.loading && !store.isSearching" class="flex flex-col items-center justify-center h-64">
          <!-- Glassmorphism loader spinner -->
          <div class="w-8 h-8 border-4 border-explorer-accent border-t-transparent rounded-full animate-spin mb-3"></div>
          <span class="text-xs text-neutral-500">Membaca isi direktori...</span>
        </div>
        
        <div v-else>
          <div v-if="store.error" class="bg-red-950/40 border border-red-900 text-red-400 p-3 rounded-lg text-xs mb-5 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {{ store.error }}
          </div>
          
          <!-- Core File Grid Component -->
          <FileGrid />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useExplorerStore } from '../stores/explorer';
import Toolbar from '../components/Toolbar.vue';
import FolderTree from '../components/FolderTree.vue';
import FileGrid from '../components/FileGrid.vue';

const route = useRoute();
const store = useExplorerStore();

// Watch parameter rute ID untuk memicu loadFolder reaktif
watch(
  () => route.params.id,
  (newId) => {
    const targetId = typeof newId === 'string' ? newId : null;
    store.loadFolder(targetId);
  },
  { immediate: true }
);

onMounted(async () => {
  if (store.rootFolders.length === 0) {
    await store.fetchRootFolders();
  }
});
</script>
