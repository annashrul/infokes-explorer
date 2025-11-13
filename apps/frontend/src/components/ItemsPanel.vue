<template>
  <div class="items-panel p-4 min-h-full" @contextmenu.prevent="handleEmptySpaceRightClick">
    <div v-if="selectedFolder" class="flex items-center justify-between mb-4 pb-2 border-b border-win11-border">
      <div class="flex items-center gap-2">
        <FolderIcon :size="20" class="text-blue-600" />
        <h2 class="text-lg font-medium text-win11-text">{{ selectedFolder.name }}</h2>
      </div>
    </div>

    <!-- List View Header -->
    <div v-if="subfolders.length > 0 || files.length > 0" class="border-b border-gray-200" @contextmenu.prevent="handleEmptySpaceRightClick">
      <div class="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50">
        <div class="col-span-6">Name</div>
        <div class="col-span-2">Date modified</div>
        <div class="col-span-2">Type</div>
        <div class="col-span-2">Size</div>
      </div>
    </div>
    
    <!-- List View Content -->
    <div v-if="subfolders.length > 0 || files.length > 0" class="divide-y divide-gray-100 min-h-[200px]" @contextmenu.prevent.self="handleEmptySpaceRightClick">
      <div
        v-for="folder in subfolders"
        :key="'folder-' + folder.id"
        class="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
        @click="handleFolderClick(folder)"
        @dblclick="handleFolderDoubleClick(folder)"
        @contextmenu.prevent.stop="handleFolderRightClick($event, folder)"
      >
        <div class="col-span-6 flex items-center gap-2">
          <FolderIcon :size="16" class="text-yellow-600" />
          <input
            v-if="editingFolderId === folder.id"
            v-model="editingName"
            type="text"
            class="text-sm px-1 border border-blue-500 outline-none bg-white flex-1 edit-input"
            @blur="saveEditingFolder(folder)"
            @keyup.enter="saveEditingFolder(folder)"
            @keyup.esc="cancelEditing"
            @click.stop
          />
          <span v-else class="text-sm">{{ folder.name }}</span>
        </div>
        <div class="col-span-2 text-sm text-gray-600">{{ formatDate(folder.updatedAt) }}</div>
        <div class="col-span-2 text-sm text-gray-600">File folder</div>
        <div class="col-span-2 text-sm text-gray-600">-</div>
      </div>

      <div
        v-for="file in files"
        :key="'file-' + file.id"
        class="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
        @dblclick="handleFileDoubleClick(file)"
        @contextmenu.prevent.stop="handleFileRightClick($event, file)"
      >
        <div class="col-span-6 flex items-center gap-2">
          <FileText :size="16" class="text-blue-600" />
          <input
            v-if="editingFileId === file.id"
            v-model="editingName"
            type="text"
            class="text-sm px-1 border border-blue-500 outline-none bg-white flex-1 edit-input"
            @blur="saveEditingFile(file)"
            @keyup.enter="saveEditingFile(file)"
            @keyup.esc="cancelEditing"
            @click.stop
          />
          <span v-else class="text-sm">{{ file.name }}</span>
        </div>
        <div class="col-span-2 text-sm text-gray-600">{{ formatDate(file.updatedAt) }}</div>
        <div class="col-span-2 text-sm text-gray-600">Text Document</div>
        <div class="col-span-2 text-sm text-gray-600">{{ formatSize(file.size) }}</div>
      </div>
    </div>

    <div v-else-if="selectedFolder" class="text-center text-gray-500 py-10">
      <FolderIcon :size="64" class="mx-auto mb-4 text-gray-300" />
      <p class="mb-4">This folder is empty</p>
      <button 
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        @click.stop="handleEmptyFolderNew"
      >
        <Plus :size="16" />
        New
      </button>
    </div>

    <div v-else class="text-center text-gray-500 py-10">
      <FolderOpenIcon :size="64" class="mx-auto mb-4 text-gray-300" />
      <p>Select a folder to view its contents</p>
    </div>
    
    <ContextMenuWithSubmenu
      :visible="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @action="handleContextAction"
      @close="showContextMenu = false"
    />
    
    <ContextMenuWithSubmenu
      :visible="showFileContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="fileContextMenuItems"
      @action="handleFileContextAction"
      @close="showFileContextMenu = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { Folder as FolderIcon, FolderOpen as FolderOpenIcon, FileText, FolderPlus, Edit, Trash2, Plus } from 'lucide-vue-next';
import ContextMenuWithSubmenu from './ContextMenuWithSubmenu.vue';
import type { Folder, File } from '../types';

interface Props {
  selectedFolder: Folder | null;
  subfolders: Folder[];
  files: File[];
  closeContextMenu?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  selectFolder: [folder: Folder];
  createSubfolder: [parentFolder: Folder];
  renameFolder: [folder: Folder];
  deleteFolder: [folder: Folder];
  createFile: [parentFolder: Folder];
  renameFile: [file: File];
  deleteFile: [file: File];
}>();

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedContextFolder = ref<Folder | null>(null);
const showFileContextMenu = ref(false);
const selectedContextFile = ref<File | null>(null);
const editingFolderId = ref<number | null>(null);
const editingFileId = ref<number | null>(null);
const editingName = ref('');
const clickTimer = ref<number | null>(null);
const clickedFolder = ref<Folder | null>(null);

// Watch untuk menutup context menu dari parent
watch(() => props.closeContextMenu, () => {
  showContextMenu.value = false;
  showFileContextMenu.value = false;
});

const contextMenuItems = computed(() => {
  const items = [
    { label: 'Folder', icon: FolderPlus, action: 'create-folder' },
    { label: 'File', icon: FileText, action: 'create-file' }
  ];
  
  if (selectedContextFolder.value) {
    items.push(
      { label: 'Rename', icon: Edit, action: 'rename' },
      ...(selectedContextFolder.value.id !== 1 ? [{ label: 'Delete', icon: Trash2, action: 'delete', danger: true }] : [])
    );
  }
  
  return items;
});

const fileContextMenuItems = computed(() => [
  { label: 'Rename', icon: Edit, action: 'rename-file' },
  { label: 'Delete', icon: Trash2, action: 'delete-file', danger: true }
]);

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleFolderRightClick = (event: MouseEvent, folder: Folder) => {
  event.preventDefault();
  event.stopPropagation();
  
  selectedContextFolder.value = folder;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  showContextMenu.value = true;
  showFileContextMenu.value = false;
};

// Handle right click on empty space
const handleEmptySpaceRightClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (props.selectedFolder) {
    selectedContextFolder.value = null;
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
    showContextMenu.value = true;
    showFileContextMenu.value = false;
  }
};

const handleFileRightClick = (event: MouseEvent, file: File) => {
  event.preventDefault();
  event.stopPropagation();
  
  selectedContextFile.value = file;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  showFileContextMenu.value = true;
  showContextMenu.value = false;
};

const handleContextAction = (action: string) => {
  const targetFolder = selectedContextFolder.value || props.selectedFolder;
  
  switch (action) {
    case 'create-folder':
      if (targetFolder) {
        emit('createSubfolder', targetFolder);
      }
      break;
    case 'create-file':
      if (targetFolder) {
        emit('createFile', targetFolder);
      }
      break;
    case 'rename':
      if (selectedContextFolder.value) {
        emit('renameFolder', selectedContextFolder.value);
      }
      break;
    case 'delete':
      if (selectedContextFolder.value) {
        emit('deleteFolder', selectedContextFolder.value);
      }
      break;
  }
};

const handleFileContextAction = (action: string) => {
  if (!selectedContextFile.value) return;
  
  switch (action) {
    case 'rename-file':
      emit('renameFile', selectedContextFile.value);
      break;
    case 'delete-file':
      emit('deleteFile', selectedContextFile.value);
      break;
  }
};

const handleEmptyFolderNew = (event: MouseEvent) => {
  if (!props.selectedFolder) return;
  event.preventDefault();
  event.stopPropagation();
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  contextMenuX.value = rect.left;
  contextMenuY.value = rect.bottom + 5;
  selectedContextFolder.value = null;
  showFileContextMenu.value = false;
  showContextMenu.value = true;
};

const handleFolderClick = (folder: Folder) => {
  if (editingFolderId.value === folder.id) return;
  
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
  }
  
  clickTimer.value = window.setTimeout(() => {
    emit('selectFolder', folder);
    clickTimer.value = null;
  }, 250);
};

const handleFolderDoubleClick = (folder: Folder) => {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
  }
  startEditingFolder(folder);
};

const handleFileDoubleClick = (file: File) => {
  startEditingFile(file);
};

const startEditingFolder = (folder: Folder) => {
  editingFolderId.value = folder.id;
  editingName.value = folder.name;
  nextTick(() => {
    const input = document.querySelector('.edit-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const startEditingFile = (file: File) => {
  editingFileId.value = file.id;
  editingName.value = file.name;
  nextTick(() => {
    const input = document.querySelector('.edit-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const saveEditingFolder = (folder: Folder) => {
  if (editingName.value.trim() && editingName.value !== folder.name) {
    emit('renameFolder', { ...folder, name: editingName.value.trim() });
  }
  cancelEditing();
};

const saveEditingFile = (file: File) => {
  if (editingName.value.trim() && editingName.value !== file.name) {
    emit('renameFile', { ...file, name: editingName.value.trim() });
  }
  cancelEditing();
};

const cancelEditing = () => {
  editingFolderId.value = null;
  editingFileId.value = null;
  editingName.value = '';
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
  }
};

// Auto-edit newly created items
watch(() => props.subfolders, (newFolders, oldFolders) => {
  if (newFolders.length > (oldFolders?.length || 0)) {
    const newFolder = newFolders.find(f => f.name === 'New folder');
    if (newFolder) {
      setTimeout(() => startEditingFolder(newFolder), 100);
    }
  }
});

watch(() => props.files, (newFiles, oldFiles) => {
  if (newFiles.length > (oldFiles?.length || 0)) {
    const newFile = newFiles.find(f => f.name === 'New file.txt');
    if (newFile) {
      setTimeout(() => startEditingFile(newFile), 100);
    }
  }
});
</script>
