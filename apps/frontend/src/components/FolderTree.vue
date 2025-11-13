<template>
  <div class="space-y-1">
    <FolderTreeItem
      v-for="folder in folders"
      :key="folder.id"
      :folder="folder"
      :selected-id="props.selectedId"
      :close-context-menu="props.closeContextMenu"
      @select="$emit('select', $event)"
      @create-subfolder="$emit('createSubfolder', $event)"
      @rename-folder="$emit('renameFolder', $event)"
      @delete-folder="$emit('deleteFolder', $event)"
      @create-file="$emit('createFile', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import FolderTreeItem from './FolderTreeItem.vue';
import type { Folder } from '../types';

interface Props {
  folders: Folder[];
  selectedId: number | null;
  closeContextMenu?: number;
}

const props = defineProps<Props>();
defineEmits<{
  select: [folder: Folder];
  createSubfolder: [parentFolder: Folder];
  renameFolder: [folder: Folder];
  deleteFolder: [folder: Folder];
  createFile: [parentFolder: Folder];
}>();
</script>
