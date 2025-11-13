<template>
  <div
    v-if="visible"
    class="context-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
    @mouseleave="handleMenuLeave"
  >
    <div
      v-for="item in items"
      :key="item.label"
      class="relative"
      @mouseenter="handleMouseEnter(item)"
    >
      <button
        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between transition-colors"
        :class="{ 'text-red-600 hover:bg-red-50': item.danger }"
        @click="handleClick(item, $event)"
      >
        <div class="flex items-center gap-2">
          <component :is="item.icon" :size="16" />
          {{ item.label }}
        </div>
        <ChevronRight v-if="item.submenu" :size="14" class="text-gray-400" />
      </button>
      
      <!-- Submenu -->
      <div
        v-if="item.submenu && showSubmenu === item.label"
        class="context-menu absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 z-10"
        @mouseenter="keepSubmenuOpen(item.label)"
      >
        <button
          v-for="subItem in item.submenu"
          :key="subItem.label"
          class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
          @click="handleSubmenuClick(subItem, $event)"
        >
          <component :is="subItem.icon" :size="16" />
          {{ subItem.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronRight } from 'lucide-vue-next';
import type { Component } from 'vue';

interface SubmenuItem {
  label: string;
  icon: Component;
  action: string;
}

interface MenuItem {
  label: string;
  icon: Component;
  action?: string;
  danger?: boolean;
  submenu?: SubmenuItem[];
}

interface Props {
  visible: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  action: [action: string];
  close: [];
}>();

const showSubmenu = ref<string | null>(null);

const handleMouseEnter = (item: MenuItem) => {
  if (item.submenu) {
    showSubmenu.value = item.label;
  } else {
    showSubmenu.value = null;
  }
};

const keepSubmenuOpen = (label: string) => {
  showSubmenu.value = label;
};

const handleMenuLeave = () => {
  setTimeout(() => {
    showSubmenu.value = null;
  }, 300);
};

const handleClick = (item: MenuItem, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  if (!item.submenu && item.action) {
    emit('action', item.action);
    emit('close');
  }
};

const handleSubmenuClick = (subItem: SubmenuItem, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  emit('action', subItem.action);
  emit('close');
};
</script>