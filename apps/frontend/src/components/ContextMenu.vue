<template>
  <div
    v-if="visible"
    class="fixed z-50 bg-white border border-win11-border rounded-lg shadow-lg py-1 min-w-48"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <button
      v-for="item in items"
      :key="item.label"
      class="w-full px-3 py-2 text-left text-sm text-win11-text hover:bg-win11-hover flex items-center gap-2 transition-colors"
      :class="{ 'text-red-600 hover:bg-red-50': item.danger }"
      @click="handleClick(item)"
    >
      <component :is="item.icon" :size="16" />
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface MenuItem {
  label: string;
  icon: Component;
  action: string;
  danger?: boolean;
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

const handleClick = (item: MenuItem) => {
  emit('action', item.action);
  emit('close');
};
</script>