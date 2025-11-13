<template>
  <div class="folder-tree-item">
    <div 
      class="folder-header flex items-center px-2 py-1 cursor-pointer rounded transition-colors hover:bg-win11-hover"
      :class="{ 'bg-blue-100 text-win11-accent': isSelected }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      @contextmenu.prevent="handleRightClick"
    >
      <button 
        class="folder-toggle w-4 h-4 flex items-center justify-center mr-1 text-gray-600 hover:bg-gray-200 rounded"
        @click.stop="toggleExpand"
      >
        <ChevronRight v-if="hasChildren && !isExpanded" :size="12" />
        <ChevronDown v-if="hasChildren && isExpanded" :size="12" />
      </button>
      <FolderIcon v-if="!isExpanded" :size="16" class="mr-2 text-blue-600" />
      <FolderOpenIcon v-else :size="16" class="mr-2 text-blue-600" />
      <input
        v-if="isEditing"
        v-model="editingName"
        type="text"
        class="text-sm px-1 border border-blue-500 outline-none bg-white flex-1 tree-edit-input"
        @blur="saveEditing"
        @keyup.enter="saveEditing"
        @keyup.esc="cancelEditing"
        @click.stop
      />
      <span v-else class="text-sm">{{ folder.name }}</span>
    </div>
    <div v-if="isExpanded && hasChildren" class="folder-children ml-5">
      <FolderTreeItem
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :selected-id="selectedId"
        :close-context-menu="closeContextMenu"
        @select="$emit('select', $event)"
        @create-subfolder="$emit('create-subfolder', $event)"
        @rename-folder="$emit('rename-folder', $event)"
        @delete-folder="$emit('delete-folder', $event)"
        @create-file="$emit('create-file', $event)"
      />
    </div>
    
    <ContextMenuWithSubmenu
      :visible="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @action="handleContextAction"
      @close="showContextMenu = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderOpen as FolderOpenIcon, FolderPlus, Edit, Trash2, Plus, FileText } from 'lucide-vue-next';
import ContextMenuWithSubmenu from './ContextMenuWithSubmenu.vue';
import { useTreeState } from '../composables/useTreeState';
import type { Folder } from '../types';

interface Props {
  folder: Folder;
  selectedId: number | null;
  closeContextMenu?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [folder: Folder];
  createSubfolder: [parentFolder: Folder];
  renameFolder: [folder: Folder];
  deleteFolder: [folder: Folder];
  createFile: [parentFolder: Folder];
}>();

const { isExpanded: isExpandedGlobal, toggleExpanded } = useTreeState();
const isExpanded = computed(() => isExpandedGlobal(props.folder.id));
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const isEditing = ref(false);
const editingName = ref('');
const clickTimer = ref<number | null>(null);

// Watch untuk menutup context menu dari parent
watch(() => props.closeContextMenu, () => {
  showContextMenu.value = false;
});

const hasChildren = computed(() => 
  props.folder.children && props.folder.children.length > 0
);

const isSelected = computed(() => 
  props.selectedId === props.folder.id
);

const toggleExpand = () => {
  if (hasChildren.value) {
    toggleExpanded(props.folder.id);
  }
};

const contextMenuItems = computed(() => [
  {
    label: 'New',
    icon: Plus,
    submenu: [
      { label: 'Folder', icon: FolderPlus, action: 'create-folder' },
      { label: 'File', icon: FileText, action: 'create-file' }
    ]
  },
  { label: 'Rename', icon: Edit, action: 'rename' },
  ...(props.folder.id !== 1 ? [{ label: 'Delete', icon: Trash2, action: 'delete', danger: true }] : [])
]);

const handleClick = () => {
  if (isEditing.value) return;
  
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
  }
  
  clickTimer.value = window.setTimeout(() => {
    emit('select', props.folder);
    clickTimer.value = null;
  }, 250);
};

const handleDoubleClick = () => {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
  }
  startEditing();
};

const startEditing = () => {
  isEditing.value = true;
  editingName.value = props.folder.name;
  nextTick(() => {
    const input = document.querySelector('.tree-edit-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const saveEditing = () => {
  if (editingName.value.trim() && editingName.value !== props.folder.name) {
    emit('renameFolder', { ...props.folder, name: editingName.value.trim() });
  }
  cancelEditing();
};

const cancelEditing = () => {
  isEditing.value = false;
  editingName.value = '';
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
  }
};

const handleRightClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  showContextMenu.value = true;
};

const handleContextAction = (action: string) => {
  switch (action) {
    case 'create-folder':
      emit('createSubfolder', props.folder);
      break;
    case 'create-file':
      emit('createFile', props.folder);
      break;
    case 'rename':
      emit('renameFolder', props.folder);
      break;
    case 'delete':
      emit('deleteFolder', props.folder);
      break;
  }
};
</script>
