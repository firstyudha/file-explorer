<template>
  <div class="h-full w-full">
    <!-- Empty State -->
    <div v-if="isEmpty" class="flex flex-col items-center justify-center h-64 text-neutral-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-3 text-neutral-600">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A9.75 9.75 0 0112 2.25e-04c5.385 0 9.75 4.365 9.75 9.75v.75m-19.5 0h19.5" />
      </svg>
      <span class="text-sm">Folder ini kosong</span>
    </div>

    <!-- Items Grid Layout -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
      <!-- 1. Render Subfolders first -->
      <div 
        v-for="subfolder in displayFolders" 
        :key="subfolder.id"
        class="flex flex-col items-center justify-center p-3 rounded-lg border border-transparent hover:border-neutral-800 hover:bg-neutral-800/40 cursor-pointer select-none text-center group transition-all duration-150"
        @dblclick="openFolder(subfolder.id)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-yellow-500/80 mb-2 transform group-hover:scale-105 transition-transform duration-150">
          <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.75l-.94-1.88A.75.75 0 009.64 3.75H4.5a3 3 0 00-3 3v10.5a3 3 0 003 3h15z" />
        </svg>
        <span class="text-xs text-gray-300 font-medium truncate max-w-full leading-tight px-1">{{ subfolder.name }}</span>
      </div>

      <!-- 2. Render Files second -->
      <div 
        v-for="file in displayFiles" 
        :key="file.id"
        class="flex flex-col items-center justify-center p-3 rounded-lg border border-transparent hover:border-neutral-800 hover:bg-neutral-800/40 cursor-default select-none text-center group transition-all duration-150"
      >
        <div class="relative mb-2">
          <!-- Premium File Icon based on extension -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12" :class="getFileIconColor(file.extension)">
            <path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm5.845 17.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V12a.75.75 0 00-1.5 0v2.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M14.25 7.5a.75.75 0 01-.75-.75V3.75c2.25.082 4.068 1.9 4.15 4.15H14.25z" clip-rule="evenodd" />
          </svg>
          <span class="absolute bottom-1 right-2 bg-neutral-900/80 text-[8px] font-bold px-1 rounded uppercase tracking-wider scale-90">{{ file.extension }}</span>
        </div>
        <span class="text-xs text-gray-300 font-medium truncate max-w-full leading-tight px-1">{{ file.name }}</span>
        <span class="text-[10px] text-neutral-500 mt-1">{{ formatBytes(file.size) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExplorerStore } from '../stores/explorer';

const store = useExplorerStore();
const router = useRouter();

// Menghitung apakah grid sedang mencari atau menampilkan isi folder saat ini
const displayFolders = computed(() => {
  return store.isSearching ? store.searchResults.folders : (store.currentFolder ? store.currentFolder.children : []);
});

const displayFiles = computed(() => {
  return store.isSearching ? store.searchResults.files : (store.currentFolder ? store.currentFolder.files : []);
});

const isEmpty = computed(() => displayFolders.value.length === 0 && displayFiles.value.length === 0);

function openFolder(id: string) {
  router.push(`/folder/${id}`);
}

// Skema warna kustom dinamis berdasarkan ekstensi berkas
function getFileIconColor(ext: string): string {
  const e = ext.toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(e)) return 'text-emerald-500/80';
  if (['docx', 'doc', 'txt'].includes(e)) return 'text-blue-500/80';
  if (['pdf'].includes(e)) return 'text-red-500/80';
  if (['zip', 'rar', 'tar', 'gz'].includes(e)) return 'text-amber-600/80';
  if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(e)) return 'text-purple-500/80';
  return 'text-gray-400';
}

function formatBytes(bytesStr: string): string {
  const bytes = parseInt(bytesStr, 10);
  if (isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
</script>
