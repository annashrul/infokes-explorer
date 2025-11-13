import { describe, test, expect, mock } from 'bun:test';
import { FolderService } from './FolderService';
import type { IFolderRepository } from '../domain/IFolderRepository';
import type { Folder } from '../domain/Folder';

describe('FolderService', () => {
  test('buildTree should create hierarchical structure', async () => {
    const mockFolders: Folder[] = [
      { id: 1, name: 'Root', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Child1', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Child2', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
    ];

    const mockRepo: IFolderRepository = {
      findAll: mock(() => Promise.resolve(mockFolders)),
      findById: mock(() => Promise.resolve(null)),
      findByParentId: mock(() => Promise.resolve([])),
      findFilesByFolderId: mock(() => Promise.resolve([])),
      search: mock(() => Promise.resolve([])),
    };

    const service = new FolderService(mockRepo);
    const tree = await service.getAllFoldersAsTree();

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('Root');
    expect(tree[0].children).toHaveLength(2);
  });

  test('searchFolders should return empty for empty query', async () => {
    const mockRepo: IFolderRepository = {
      findAll: mock(() => Promise.resolve([])),
      findById: mock(() => Promise.resolve(null)),
      findByParentId: mock(() => Promise.resolve([])),
      findFilesByFolderId: mock(() => Promise.resolve([])),
      search: mock(() => Promise.resolve([])),
    };

    const service = new FolderService(mockRepo);
    const results = await service.searchFolders('  ');

    expect(results).toHaveLength(0);
  });
});
