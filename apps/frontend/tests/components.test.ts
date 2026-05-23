import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useExplorerStore } from '../src/stores/explorer';
import { useRouter } from 'vue-router';
import FolderTreeNode from '../src/components/FolderTreeNode.vue';
import FolderTree from '../src/components/FolderTree.vue';
import FileGrid from '../src/components/FileGrid.vue';
import Breadcrumbs from '../src/components/Breadcrumbs.vue';
import Toolbar from '../src/components/Toolbar.vue';

// Mock vue-router
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRoute = {
  value: {
    path: '/folder'
  }
};

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    currentRoute: mockRoute
  }),
  useRoute: () => mockRoute
}));

describe('Frontend Vue Components', () => {
  let store: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useExplorerStore();

    // Setup spies on Pinia store actions
    vi.spyOn(store, 'loadFolder');
    vi.spyOn(store, 'fetchRootFolders');
    vi.spyOn(store, 'executeSearch');
    vi.spyOn(store, 'clearSearch');
    vi.spyOn(store, 'invalidateCache');
    vi.spyOn(store, 'toggleFolderExpand');

    vi.clearAllMocks();
  });

  describe('FolderTreeNode.vue', () => {
    const dummyFolder = {
      id: 'folder-1',
      name: 'My Documents',
      parentId: null,
      createdAt: new Date()
    };

    it('renders folder name correctly', () => {
      const wrapper = mount(FolderTreeNode, {
        props: {
          folder: dummyFolder
        }
      });

      expect(wrapper.text()).toContain('My Documents');
      // Should show premium folder icon
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('navigates to the folder on click', async () => {
      const wrapper = mount(FolderTreeNode, {
        props: {
          folder: dummyFolder
        }
      });

      // Click the folder row (the first child div)
      await wrapper.find('.cursor-pointer').trigger('click');

      expect(mockPush).toHaveBeenCalledWith('/folder/folder-1');
    });

    it('toggles expand status and lazy loads children on chevron click', async () => {
      const wrapper = mount(FolderTreeNode, {
        props: {
          folder: dummyFolder
        }
      });

      // Chevron click
      await wrapper.find('.w-4.h-4.mr-1').trigger('click');

      // Check that the store was called to toggle expand (which triggers lazy loading if not cached)
      expect(store.expandedFolderIds['folder-1']).toBe(true);
    });

    it('renders recursively if expanded and cached children exist', () => {
      // Mock cache populated with child folders
      store.explorerCache['folder-1'] = {
        id: 'folder-1',
        name: 'My Documents',
        parentId: null,
        children: [
          { id: 'child-1', name: 'Resume Project', parentId: 'folder-1', createdAt: new Date() }
        ],
        files: []
      };

      // Set expanded
      store.expandedFolderIds['folder-1'] = true;

      const wrapper = mount(FolderTreeNode, {
        props: {
          folder: dummyFolder
        }
      });

      // Should render the child node name recursively
      expect(wrapper.text()).toContain('My Documents');
      expect(wrapper.text()).toContain('Resume Project');
    });
  });

  describe('FolderTree.vue', () => {
    it('renders a loading message if root folders are empty', () => {
      const wrapper = mount(FolderTree);
      expect(wrapper.text()).toContain('Memuat folder utama...');
    });

    it('renders list of root nodes', () => {
      store.rootFolders = [
        { id: 'root-1', name: 'Desktop', parentId: null, createdAt: new Date() },
        { id: 'root-2', name: 'Downloads', parentId: null, createdAt: new Date() }
      ];

      const wrapper = mount(FolderTree);
      expect(wrapper.text()).not.toContain('Memuat folder utama...');
      expect(wrapper.text()).toContain('Desktop');
      expect(wrapper.text()).toContain('Downloads');
    });
  });

  describe('FileGrid.vue', () => {
    it('renders an empty state when folder is empty', () => {
      store.currentFolder = {
        id: 'empty-1',
        name: 'Empty Folder',
        parentId: null,
        children: [],
        files: []
      };

      const wrapper = mount(FileGrid);
      expect(wrapper.text()).toContain('Folder ini kosong');
    });

    it('renders files and folders within the current folder grid', () => {
      store.currentFolder = {
        id: 'active-folder',
        name: 'Active Folder',
        parentId: null,
        children: [
          { id: 'sub-1', name: 'Memes', parentId: 'active-folder', createdAt: new Date() }
        ],
        files: [
          { id: 'file-1', folderId: 'active-folder', name: 'cat.jpg', size: '204800', extension: 'jpg', createdAt: new Date() },
          { id: 'file-2', folderId: 'active-folder', name: 'tax_report.pdf', size: '1048576', extension: 'pdf', createdAt: new Date() }
        ]
      };

      const wrapper = mount(FileGrid);

      // Verify subfolder is rendered
      expect(wrapper.text()).toContain('Memes');

      // Verify files are rendered with correct extensions and formatted sizes
      expect(wrapper.text()).toContain('cat.jpg');
      expect(wrapper.text()).toContain('200 KB'); // 204800 B = 200 KB

      expect(wrapper.text()).toContain('tax_report.pdf');
      expect(wrapper.text()).toContain('1 MB'); // 1048576 B = 1.0 MB
    });

    it('navigates to subfolder on double click', async () => {
      store.currentFolder = {
        id: 'active-folder',
        name: 'Active Folder',
        parentId: null,
        children: [
          { id: 'sub-1', name: 'Memes', parentId: 'active-folder', createdAt: new Date() }
        ],
        files: []
      };

      const wrapper = mount(FileGrid);
      const folderDiv = wrapper.find('.cursor-pointer');
      
      await folderDiv.trigger('dblclick');
      expect(mockPush).toHaveBeenCalledWith('/folder/sub-1');
    });

    it('displays search results if store is in search mode', () => {
      store.isSearching = true;
      store.searchResults = {
        folders: [{ id: 'found-fold', name: 'Found Folder', parentId: null, createdAt: new Date() }],
        files: [{ id: 'found-file', folderId: 'x', name: 'Secret.zip', size: '4096', extension: 'zip', createdAt: new Date() }]
      };

      const wrapper = mount(FileGrid);

      expect(wrapper.text()).toContain('Found Folder');
      expect(wrapper.text()).toContain('Secret.zip');
      expect(wrapper.text()).toContain('4 KB');
    });
  });

  describe('Breadcrumbs.vue', () => {
    it('renders "This PC" root node', () => {
      const wrapper = mount(Breadcrumbs);
      expect(wrapper.text()).toContain('This PC');
    });

    it('traces active folder lineage from cache', () => {
      // Mock cached parent folders to resolve lineage
      store.explorerCache['root-id'] = {
        id: 'root-id',
        name: 'C: Drive',
        parentId: null,
        children: [],
        files: []
      };
      store.explorerCache['sub-id'] = {
        id: 'sub-id',
        name: 'Projects',
        parentId: 'root-id',
        children: [],
        files: []
      };
      store.explorerCache['current-id'] = {
        id: 'current-id',
        name: 'VueApp',
        parentId: 'sub-id',
        children: [],
        files: []
      };

      store.currentFolderId = 'current-id';
      store.currentFolder = store.explorerCache['current-id'];

      const wrapper = mount(Breadcrumbs);

      // It should build the path breadcrumbs
      const text = wrapper.text();
      expect(text).toContain('This PC');
      expect(text).toContain('C: Drive');
      expect(text).toContain('Projects');
      expect(text).toContain('VueApp');
    });

    it('navigates when clicking breadcrumb segments', async () => {
      store.explorerCache['root-id'] = {
        id: 'root-id',
        name: 'C: Drive',
        parentId: null,
        children: [],
        files: []
      };
      store.currentFolderId = 'root-id';
      store.currentFolder = store.explorerCache['root-id'];

      const wrapper = mount(Breadcrumbs);
      
      // Click C: Drive segment
      const segment = wrapper.findAll('.cursor-pointer').find(w => w.text().includes('C: Drive'));
      await segment?.trigger('click');
      expect(mockPush).toHaveBeenCalledWith('/folder/root-id');

      // Click "This PC" segment
      const pcSegment = wrapper.findAll('.cursor-pointer').find(w => w.text().includes('This PC'));
      await pcSegment?.trigger('click');
      expect(mockPush).toHaveBeenCalledWith('/folder');
    });
  });

  describe('Toolbar.vue', () => {
    it('handles search input with debounce', async () => {
      vi.useFakeTimers();
      const wrapper = mount(Toolbar);
      
      const input = wrapper.find('input');
      await input.setValue('secret_file');

      // Since search is debounced by 300ms, executeSearch should not be called immediately
      expect(store.executeSearch).not.toHaveBeenCalled();

      // Fast forward time
      vi.advanceTimersByTime(350);

      expect(store.executeSearch).toHaveBeenCalledWith('secret_file');
      vi.useRealTimers();
    });

    it('clears search when clear button is clicked', async () => {
      const wrapper = mount(Toolbar);
      const input = wrapper.find('input');
      await input.setValue('some search');

      const clearBtn = wrapper.find('button.absolute');
      await clearBtn.trigger('click');

      expect(input.element.value).toBe('');
      expect(store.clearSearch).toHaveBeenCalled();
    });

    it('performs refresh actions by invalidating cache and reloading folder', async () => {
      store.currentFolderId = 'folder-xyz';
      
      const wrapper = mount(Toolbar);
      // Click refresh button (third button)
      const refreshBtn = wrapper.findAll('button').at(2);
      await refreshBtn?.trigger('click');

      expect(store.invalidateCache).toHaveBeenCalledWith('folder-xyz');
      expect(store.loadFolder).toHaveBeenCalledWith('folder-xyz');
    });
  });
});
