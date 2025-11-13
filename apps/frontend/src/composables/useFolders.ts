import { ref, computed } from 'vue';
import { folderApi } from '@/services/api';
import type { Folder, File } from '@/types';

// Global state untuk folder management
const folderTree = ref<Folder[]>([]);
const selectedFolder = ref<Folder | null>(null);
const selectedFolderId = ref<number | null>(null);
const subfolders = ref<Folder[]>([]);
const files = ref<File[]>([]);
const loading = ref(false);
const error = ref('');



export function useFolders() {
  const loadFolderTree = async () => {
    try {
      loading.value = true;
      error.value = '';
      folderTree.value = await folderApi.getAllFolders();
    } catch (e) {
      error.value = 'Failed to load folder structure';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const selectFolder = async (folder: Folder) => {
    try {
      selectedFolderId.value = folder.id;
      const result = await folderApi.getFolderWithFiles(folder.id);
      selectedFolder.value = result.folder;
      subfolders.value = result.subfolders;
      files.value = result.files;
    } catch (e) {
      error.value = 'Failed to load folder contents';
      console.error(e);
    }
  };

  const createFolder = async (name: string, parentId?: number) => {
    try {
      const folder = await folderApi.createFolder(name, parentId);
      await loadFolderTree();
      return folder;
    } catch (e) {
      error.value = 'Failed to create folder';
      throw e;
    }
  };

  const updateFolder = async (id: number, name: string) => {
    try {
      const folder = await folderApi.updateFolder(id, name);
      await loadFolderTree();
      return folder;
    } catch (e) {
      error.value = 'Failed to update folder';
      throw e;
    }
  };

  const deleteFolder = async (id: number) => {
    try {
      await folderApi.deleteFolder(id);
      await loadFolderTree();
      if (selectedFolder.value?.id === id) {
        selectedFolder.value = null;
        selectedFolderId.value = null;
        subfolders.value = [];
        files.value = [];
      }
    } catch (e) {
      error.value = 'Failed to delete folder';
      throw e;
    }
  };

  const searchFolders = (query: string, originalSubfolders: Folder[], originalFiles: File[]) => {
    if (!query.trim()) {
      subfolders.value = [...originalSubfolders];
      files.value = [...originalFiles];
      return;
    }
    
    const filteredSubfolders = originalSubfolders.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    );
    const filteredFiles = originalFiles.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    );
    
    subfolders.value = filteredSubfolders;
    files.value = filteredFiles;
  };

  const createFile = async (name: string, folderId: number) => {
    try {
      const file = await folderApi.createFile(name, folderId);
      if (selectedFolder.value?.id === folderId) {
        await selectFolder(selectedFolder.value);
      }
      return file;
    } catch (e) {
      error.value = 'Failed to create file';
      throw e;
    }
  };

  const updateFile = async (id: number, name: string) => {
    try {
      const file = await folderApi.updateFile(id, name);
      if (selectedFolder.value) {
        await selectFolder(selectedFolder.value);
      }
      return file;
    } catch (e) {
      error.value = 'Failed to update file';
      throw e;
    }
  };

  const deleteFile = async (id: number) => {
    try {
      await folderApi.deleteFile(id);
      if (selectedFolder.value) {
        await selectFolder(selectedFolder.value);
      }
    } catch (e) {
      error.value = 'Failed to delete file';
      throw e;
    }
  };

  return {
    // State
    folderTree: computed(() => folderTree.value),
    selectedFolder: computed(() => selectedFolder.value),
    selectedFolderId: computed(() => selectedFolderId.value),
    subfolders: computed(() => subfolders.value),
    files: computed(() => files.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Actions
    loadFolderTree,
    selectFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    searchFolders,
    createFile,
    updateFile,
    deleteFile
  };
}