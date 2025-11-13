import { ref } from 'vue';

const loadExpandedState = (): Set<number> => {
  const saved = localStorage.getItem('expandedFolders');
  if (saved) {
    try {
      return new Set(JSON.parse(saved));
    } catch (e) {
      return new Set();
    }
  }
  return new Set();
};

const saveExpandedState = (expanded: Set<number>) => {
  localStorage.setItem('expandedFolders', JSON.stringify(Array.from(expanded)));
};

const expandedFolders = ref<Set<number>>(loadExpandedState());

export function useTreeState() {
  const isExpanded = (folderId: number) => {
    return expandedFolders.value.has(folderId);
  };

  const toggleExpanded = (folderId: number) => {
    if (expandedFolders.value.has(folderId)) {
      expandedFolders.value.delete(folderId);
    } else {
      expandedFolders.value.add(folderId);
    }
    saveExpandedState(expandedFolders.value);
  };

  const setExpanded = (folderId: number, expanded: boolean) => {
    if (expanded) {
      expandedFolders.value.add(folderId);
    } else {
      expandedFolders.value.delete(folderId);
    }
    saveExpandedState(expandedFolders.value);
  };

  return {
    isExpanded,
    toggleExpanded,
    setExpanded
  };
}