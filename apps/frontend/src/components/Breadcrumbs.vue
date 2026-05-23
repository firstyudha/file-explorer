<template>
  <div class="flex items-center space-x-1 text-xs bg-neutral-900/60 border border-neutral-800 rounded px-3 py-1.5 flex-1 select-none overflow-x-auto whitespace-nowrap scrollbar-none">
    <!-- PC / Root Icon -->
    <span 
      class="text-neutral-400 hover:text-white cursor-pointer font-medium flex items-center"
      @click="navigateToRoot"
    >
      <span class="mr-1">This PC</span>
    </span>

    <!-- Breadcrumb Nodes -->
    <template v-for="(node, index) in paths" :key="index">
      <span class="text-neutral-600 font-bold">/</span>
      <span 
        class="text-neutral-300 hover:text-white cursor-pointer font-medium max-w-[150px] truncate"
        @click="navigateTo(node.id)"
      >
        {{ node.name }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExplorerStore } from '../stores/explorer';

const store = useExplorerStore();
const router = useRouter();

// Membuat jejak breadcrumb dari folder saat ini
const paths = computed(() => {
  if (!store.currentFolder) return [];
  const list = [];
  
  let activeId = store.currentFolderId;
  while (activeId) {
    const cached = store.explorerCache[activeId];
    if (cached) {
      list.unshift({ id: cached.id, name: cached.name });
      activeId = cached.parentId;
    } else {
      break;
    }
  }
  return list;
});

function navigateToRoot() {
  router.push('/folder');
}

function navigateTo(id: string) {
  router.push(`/folder/${id}`);
}
</script>
