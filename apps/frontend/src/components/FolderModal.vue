<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg p-6 min-w-80 shadow-xl" @click.stop>
      <h3 class="text-lg font-semibold text-win11-text mb-4 flex items-center gap-2">
        <component :is="icon" :size="20" />
        {{ title }}
      </h3>
      
      <div v-if="type === 'delete'" class="mb-4">
        <p class="text-win11-text mb-2">Are you sure you want to delete "{{ folder?.name }}"?</p>
        <p class="text-red-600 text-sm">This will also delete all subfolders and files inside.</p>
      </div>
      
      <input 
        v-else
        v-model="folderName" 
        type="text" 
        :placeholder="placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-win11-accent focus:border-transparent mb-4"
        @keyup.enter="handleSubmit"
        ref="inputRef"
      />
      
      <div class="flex gap-2 justify-end">
        <button 
          @click="handleSubmit" 
          :disabled="type !== 'delete' && !folderName.trim()"
          :class="[
            'px-4 py-2 rounded transition-colors',
            type === 'delete' 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-win11-accent text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
          ]"
        >
          {{ submitText }}
        </button>
        <button 
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { FolderPlus, Edit, Trash2 } from 'lucide-vue-next';
import type { Folder } from '../types';

interface Props {
  visible: boolean;
  type: 'create' | 'rename' | 'delete';
  folder?: Folder | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [name: string];
  close: [];
}>();

const folderName = ref('');
const inputRef = ref<HTMLInputElement>();

const title = computed(() => {
  switch (props.type) {
    case 'create': return 'Create New Folder';
    case 'rename': return 'Rename Folder';
    case 'delete': return 'Delete Folder';
  }
});

const icon = computed(() => {
  switch (props.type) {
    case 'create': return FolderPlus;
    case 'rename': return Edit;
    case 'delete': return Trash2;
  }
});

const placeholder = computed(() => {
  switch (props.type) {
    case 'create': return 'Enter folder name';
    case 'rename': return 'Enter new name';
    default: return '';
  }
});

const submitText = computed(() => {
  switch (props.type) {
    case 'create': return 'Create';
    case 'rename': return 'Rename';
    case 'delete': return 'Delete';
  }
});

watch(() => props.visible, async (visible) => {
  if (visible) {
    if (props.type === 'rename' && props.folder) {
      folderName.value = props.folder.name;
    } else {
      folderName.value = '';
    }
    
    if (props.type !== 'delete') {
      await nextTick();
      inputRef.value?.focus();
    }
  }
});

const handleSubmit = () => {
  if (props.type === 'delete') {
    emit('submit', '');
  } else if (folderName.value.trim()) {
    emit('submit', folderName.value.trim());
  }
};
</script>