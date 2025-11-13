<template>
  <div id="app" class="h-screen flex flex-col bg-win11-bg" @click="closeAllContextMenus($event)">
    <!-- Windows 11 Header -->
    <div class="bg-white">
      <!-- Navigation Bar -->
      <div class="flex items-center px-4 py-2 border-b border-gray-200">
        <div class="flex items-center gap-1 mr-4">
          <button 
            class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
            :disabled="navigationHistory.length <= 1"
            @click="goBack"
          >
            <ArrowLeft :size="16" />
          </button>
          <button 
            class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
            :disabled="forwardHistory.length === 0"
            @click="goForward"
          >
            <ArrowRight :size="16" />
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
            <ArrowUp :size="16" />
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
            <RotateCcw :size="16" />
          </button>
        </div>
        
        <!-- Breadcrumb -->
        <div class="flex items-center flex-1 text-sm overflow-x-auto">
          <button class="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1" @click="navigateToRoot">
            <Monitor :size="16" />
            This PC
          </button>
          <template v-for="folder in breadcrumbPath" :key="folder.id">
            <ChevronRight :size="14" class="text-gray-400 mx-1" />
            <button 
              class="px-2 py-1 hover:bg-gray-100 rounded whitespace-nowrap"
              @click="navigateToBreadcrumb(folder)"
            >
              {{ folder.name }}
            </button>
          </template>
        </div>
        
        <!-- Search -->
        <div class="flex items-center">
          <div class="relative">
            <Search :size="16" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="selectedFolder ? `Search ${selectedFolder.name}` : 'Search'"
              class="pl-10 pr-4 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm w-64 focus:outline-none focus:bg-white focus:border-blue-500"
              @input="handleSearch"
            />
          </div>
        </div>
      </div>
      

    </div>

    <div v-if="error" class="bg-red-50 text-red-800 p-3 m-2 rounded border border-red-200">{{ error }}</div>

    <div v-if="loading" class="text-center text-gray-600 py-10">
      <div class="animate-spin w-8 h-8 border-2 border-win11-accent border-t-transparent rounded-full mx-auto mb-2"></div>
      Loading...
    </div>

    <div v-else class="flex flex-1 bg-white overflow-hidden">
      <!-- Sidebar -->
      <div class="bg-gray-50 border-r border-gray-200 overflow-y-auto" :style="{ width: leftPanelWidth + 'px' }">
        <!-- This PC -->
        <div class="p-3">
          <div class="text-xs font-semibold text-gray-600 mb-2">This PC</div>
          <div class="space-y-1">
            <FolderTree
              :folders="folderTree"
              :selected-id="selectedFolderId"
              :close-context-menu="contextMenuBus"
              @select="handleFolderSelect"
              @create-subfolder="handleCreateSubfolder"
              @rename-folder="handleRenameFolder"
              @delete-folder="handleDeleteFolder"
              @create-file="handleCreateFile"
            />
          </div>
        </div>
      </div>

      <!-- Resize Handle -->
      <div 
        class="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize"
        @mousedown="startResize"
      ></div>

      <!-- Main Content -->
      <div class="flex-1 bg-white">
        <ItemsPanel
          :selected-folder="selectedFolder"
          :subfolders="subfolders"
          :files="files"
          :close-context-menu="contextMenuBus"
          @select-folder="handleFolderSelect"
          @create-subfolder="handleCreateSubfolder"
          @rename-folder="handleRenameFolder"
          @delete-folder="handleDeleteFolder"
          @create-file="handleCreateFile"
          @rename-file="handleRenameFile"
          @delete-file="handleDeleteFile"
        />
      </div>
    </div>
    
    <!-- Modals -->
    <FolderModal
      :visible="showCreateDialog"
      type="create"
      @submit="handleCreateSubmit"
      @close="showCreateDialog = false"
    />
    
    <FolderModal
      :visible="showEditDialog"
      type="rename"
      :folder="targetFolder"
      @submit="handleRenameSubmit"
      @close="showEditDialog = false"
    />
    
    <FolderModal
      :visible="showDeleteDialog"
      type="delete"
      :folder="targetFolder"
      @submit="handleDeleteSubmit"
      @close="showDeleteDialog = false"
    />
    
    <!-- File Modals -->
    <FileModal
      :visible="showCreateFileDialog"
      type="create"
      @submit="handleCreateFileSubmit"
      @close="closeFileModal"
    />
    
    <FileModal
      :visible="showEditFileDialog"
      type="rename"
      :file="targetFile"
      @submit="handleRenameFileSubmit"
      @close="showEditFileDialog = false"
    />
    
    <FileModal
      :visible="showDeleteFileDialog"
      type="delete"
      :file="targetFile"
      @submit="handleDeleteFileSubmit"
      @close="showDeleteFileDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTreeState } from '@/composables/useTreeState';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Monitor, ChevronRight, Search } from 'lucide-vue-next';
import FolderTree from '@/components/FolderTree.vue';
import ItemsPanel from '@/components/ItemsPanel.vue';
import FolderModal from '@/components/FolderModal.vue';
import FileModal from '@/components/FileModal.vue';
import { useFolders } from '@/composables/useFolders';
import type { Folder, File } from '@/types';

const {
  folderTree,
  selectedFolder,
  selectedFolderId,
  subfolders,
  files,
  loading,
  error,
  loadFolderTree,
  selectFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  searchFolders,
  createFile,
  updateFile,
  deleteFile
} = useFolders();

const searchQuery = ref('');
const navigationHistory = ref<Folder[]>([]);
const forwardHistory = ref<Folder[]>([]);

const breadcrumbPath = ref<Folder[]>([]);
const originalSubfolders = ref<Folder[]>([]);
const originalFiles = ref<File[]>([]);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const targetFolder = ref<Folder | null>(null);
const showCreateFileDialog = ref(false);
const showEditFileDialog = ref(false);
const showDeleteFileDialog = ref(false);
const targetFile = ref<File | null>(null);

const handleFolderSelect = async (folder: Folder, addToHistory = true) => {
  await selectFolder(folder);

  buildBreadcrumbPath(folder);
  searchQuery.value = '';
  originalSubfolders.value = [...subfolders.value];
  originalFiles.value = [...files.value];
  
  // Update URL query string
  const url = new URL(window.location.href);
  url.searchParams.set('folderId', folder.id.toString());
  window.history.pushState({}, '', url);
  
  // Expand parent folders in tree
  expandParentFolders(folder);
  
  if (addToHistory) {
    navigationHistory.value.push(folder);
    forwardHistory.value = []; // Clear forward history when navigating to new folder
  }
};

const buildBreadcrumbPath = (folder: Folder) => {
  const path: Folder[] = [];
  let current: Folder | undefined = folder;
  
  while (current) {
    path.unshift(current);
    if (current.parentId) {
      current = findFolderById(folderTree.value, current.parentId);
    } else {
      break;
    }
  }
  
  breadcrumbPath.value = path;
};

const findFolderById = (folders: Folder[], id: number): Folder | undefined => {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    if (folder.children) {
      const found = findFolderById(folder.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const navigateToBreadcrumb = async (folder: Folder) => {
  await handleFolderSelect(folder, true);
};

const navigateToRoot = () => {
  // Reset all state through the composable
  loadFolderTree();
  breadcrumbPath.value = [];
  navigationHistory.value = [];
  forwardHistory.value = [];
  
  // Clear URL query string
  const url = new URL(window.location.href);
  url.searchParams.delete('folderId');
  window.history.pushState({}, '', url);
};

const expandParentFolders = (folder: Folder) => {
  const path: number[] = [];
  let current: Folder | undefined = folder;
  
  // Add current folder to path
  path.push(current.id);
  
  // Add all parent folders to path
  while (current && current.parentId) {
    path.unshift(current.parentId);
    current = findFolderById(folderTree.value, current.parentId);
  }
  
  // Expand all folders in path (including current folder)
  const { setExpanded } = useTreeState();
  path.forEach(id => setExpanded(id, true));
};

const restoreStateFromUrl = async () => {
  const url = new URL(window.location.href);
  const folderId = url.searchParams.get('folderId');
  
  if (folderId) {
    const folder = findFolderById(folderTree.value, parseInt(folderId));
    if (folder) {
      await handleFolderSelect(folder, false);
    }
  }
};

const goBack = async () => {
  if (navigationHistory.value.length > 1) {
    const current = navigationHistory.value.pop();
    if (current) {
      forwardHistory.value.push(current);
    }
    const previous = navigationHistory.value[navigationHistory.value.length - 1];
    if (previous) {
      await handleFolderSelect(previous, false);
    }
  }
};

const goForward = async () => {
  if (forwardHistory.value.length > 0) {
    const next = forwardHistory.value.pop();
    if (next) {
      await handleFolderSelect(next, true);
    }
  }
};

const handleSearch = () => {
  if (selectedFolder.value) {
    searchFolders(searchQuery.value, originalSubfolders.value, originalFiles.value);
  }
};

const handleCreateSubfolder = async (parentFolder: Folder) => {
  try {
    await createFolder('New folder', parentFolder.id);
    if (selectedFolder.value) {
      await handleFolderSelect(selectedFolder.value, false);
    }
  } catch (error) {
    console.error('Failed to create folder:', error);
  }
};

const handleRenameFolder = async (folder: Folder) => {
  try {
    await updateFolder(folder.id, folder.name);
    if (selectedFolder.value) {
      await handleFolderSelect(selectedFolder.value, false);
    }
  } catch (error) {
    console.error('Failed to rename folder:', error);
  }
};

const handleDeleteFolder = (folder: Folder) => {
  targetFolder.value = folder;
  showDeleteDialog.value = true;
};

const handleCreateFile = async (parentFolder: Folder) => {
  try {
    await createFile('New file.txt', parentFolder.id);
    if (selectedFolder.value) {
      await handleFolderSelect(selectedFolder.value, false);
    }
  } catch (error) {
    console.error('Failed to create file:', error);
  }
};

const handleRenameFile = async (file: File) => {
  try {
    await updateFile(file.id, file.name);
    if (selectedFolder.value) {
      await handleFolderSelect(selectedFolder.value, false);
    }
  } catch (error) {
    console.error('Failed to rename file:', error);
  }
};

const handleDeleteFile = (file: File) => {
  targetFile.value = file;
  showDeleteFileDialog.value = true;
};

const handleCreateSubmit = async (name: string) => {
  if (!name.trim()) return;
  
  try {
    await createFolder(name.trim(), targetFolder.value?.id);
    if (selectedFolder.value) {
      await handleFolderSelect(selectedFolder.value, false);
    }
    showCreateDialog.value = false;
  } catch (error) {
    console.error('Failed to create folder:', error);
    alert('Failed to create folder');
  }
};

const handleRenameSubmit = async (name: string) => {
  if (!name.trim() || !targetFolder.value) return;
  
  try {
    await updateFolder(targetFolder.value.id, name.trim());
    showEditDialog.value = false;
  } catch (error) {
    console.error('Failed to rename folder:', error);
    alert('Failed to rename folder');
  }
};

const handleDeleteSubmit = async () => {
  if (!targetFolder.value) return;
  
  try {
    await deleteFolder(targetFolder.value.id);
    showDeleteDialog.value = false;
  } catch (error) {
    console.error('Failed to delete folder:', error);
    alert('Failed to delete folder');
  }
};

const closeFileModal = () => {
  showCreateFileDialog.value = false;
};

const handleCreateFileSubmit = async (name: string) => {
  if (!name.trim() || !targetFolder.value) return;
  
  try {
    await createFile(name.trim(), targetFolder.value.id);
    showCreateFileDialog.value = false;
  } catch (error) {
    console.error('Failed to create file:', error);
    alert('Failed to create file');
  }
};

const handleRenameFileSubmit = async (name: string) => {
  if (!name.trim() || !targetFile.value) return;
  
  try {
    await updateFile(targetFile.value.id, name.trim());
    showEditFileDialog.value = false;
  } catch (error) {
    console.error('Failed to rename file:', error);
    alert('Failed to rename file');
  }
};

const handleDeleteFileSubmit = async () => {
  if (!targetFile.value) return;
  
  try {
    await deleteFile(targetFile.value.id);
    showDeleteFileDialog.value = false;
  } catch (error) {
    console.error('Failed to delete file:', error);
    alert('Failed to delete file');
  }
};

// Event bus untuk menutup context menu
const contextMenuBus = ref(0);
const leftPanelWidth = ref(400);
const isResizing = ref(false);

const closeAllContextMenus = (event?: Event) => {
  // Jangan tutup jika klik di dalam context menu atau tombol yang membuka context menu
  if (event?.target) {
    const target = event.target as Element;
    if (target.closest('.context-menu') || target.closest('button')) {
      return;
    }
  }
  contextMenuBus.value++; // Trigger close di semua komponen
};

const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  e.preventDefault();
};

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return;
  const newWidth = e.clientX;
  if (newWidth >= 200 && newWidth <= 600) {
    leftPanelWidth.value = newWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
};

onMounted(async () => {
  await loadFolderTree();
  await restoreStateFromUrl();
});
</script>
