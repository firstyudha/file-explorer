<template>
  <div class="select-none text-xs">
    <!-- Folder Row Line -->
    <div 
      class="flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors duration-150"
      :class="[
        isSelected ? 'bg-explorer-active text-white border-l-2 border-explorer-accent' : 'hover:bg-explorer-hover text-gray-300'
      ]"
      @click="navigate"
    >
      <!-- Expand/Collapse Chevron Icon -->
      <span 
        class="w-4 h-4 mr-1 flex items-center justify-center text-gray-500 hover:text-white transition-transform duration-200"
        :class="{ 'rotate-90': isExpanded }"
        @click.stop="toggleExpand"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
      </span>

      <!-- Folder Premium Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-2" :class="[isSelected ? 'text-blue-400' : 'text-yellow-500/80']">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.75l-.94-1.88A.75.75 0 009.64 3.75H4.5a3 3 0 00-3 3v10.5a3 3 0 003 3h15z" />
      </svg>

      <!-- Name -->
      <span class="truncate font-medium">{{ folder.name }}</span>
    </div>

    <!-- Recursive Subfolders Children Render (Rendered if Expanded) -->
    <div v-if="isExpanded && cachedChildren.length > 0" class="pl-4 border-l border-neutral-800/80 ml-3 mt-0.5">
      <FolderTreeNode
        v-for="child in cachedChildren"
        :key="child.id"
        :folder="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExplorerStore } from '../stores/explorer';
import { Folder } from '@packages/shared-types';

const props = defineProps<{
  folder: Folder;
}>();

const store = useExplorerStore();
const router = useRouter();

// Cek apakah node ini sedang dipilih
const isSelected = computed(() => store.currentFolderId === props.folder.id);

// Cek apakah node ini dalam kondisi terekspansi
const isExpanded = computed(() => !!store.expandedFolderIds[props.folder.id]);

// Dapatkan children dari Cache (Lazy loading support)
const cachedChildren = computed(() => {
  const cached = store.explorerCache[props.folder.id];
  return cached ? cached.children : [];
});

function toggleExpand() {
  store.toggleFolderExpand(props.folder.id);
}

function navigate() {
  router.push(`/folder/${props.folder.id}`);
}
</script>
