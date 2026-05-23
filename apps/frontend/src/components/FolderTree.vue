<template>
  <div class="h-full overflow-y-auto pr-2 space-y-1">
    <div v-if="store.rootFolders.length === 0" class="text-xs text-neutral-500 py-4 px-2 italic">
      Memuat folder utama...
    </div>
    <FolderTreeNode
      v-for="folder in store.rootFolders"
      :key="folder.id"
      :folder="folder"
    />
  </div>
</template>

<script setup lang="ts">
import { useExplorerStore } from '../stores/explorer';
import FolderTreeNode from './FolderTreeNode.vue';

const store = useExplorerStore();
</script>
