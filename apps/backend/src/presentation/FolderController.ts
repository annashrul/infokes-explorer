import { Elysia, t } from 'elysia';
import type { FolderService } from '@/application/FolderService';
import type { ApiResponse } from '@packages/shared/types';

export class FolderController {
  constructor(private folderService: FolderService) {}

  routes(app: Elysia) {
    return app.group('/api/v1/folders', (app) =>
      app
        .get('/', async (): Promise<ApiResponse<any>> => {
          try {
            const tree = await this.folderService.getAllFoldersAsTree();
            return { data: tree, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to get folder tree', code: 'TREE_ERROR' } };
          }
        })
        .get('/tree', async (): Promise<ApiResponse<any>> => {
          try {
            const tree = await this.folderService.getAllFoldersAsTree();
            return { data: tree, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to get folder tree', code: 'TREE_ERROR' } };
          }
        })
        .get('/:id/children', async ({ params }): Promise<ApiResponse<any>> => {
          try {
            const subfolders = await this.folderService.getDirectSubfolders(parseInt(params.id));
            return { data: subfolders, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to get children', code: 'CHILDREN_ERROR' } };
          }
        })
        .get('/:id', async ({ params }): Promise<ApiResponse<any>> => {
          try {
            const result = await this.folderService.getFolderWithFiles(parseInt(params.id));
            return { data: result, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to get folder', code: 'FOLDER_ERROR' } };
          }
        })
        .get('/search', async ({ query }): Promise<ApiResponse<any>> => {
          try {
            const results = await this.folderService.searchFolders(query.q || '');
            return { data: results, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Search failed', code: 'SEARCH_ERROR' } };
          }
        }, {
          query: t.Object({
            q: t.String()
          })
        })
        .post('/', async ({ body }): Promise<ApiResponse<any>> => {
          try {
            const folder = await this.folderService.createFolder(body.name, body.parentId || null);
            return { data: folder, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to create folder', code: 'CREATE_ERROR' } };
          }
        }, {
          body: t.Object({
            name: t.String(),
            parentId: t.Optional(t.Number())
          })
        })
        .put('/:id', async ({ params, body }): Promise<ApiResponse<any>> => {
          try {
            const folder = await this.folderService.updateFolder(parseInt(params.id), body.name);
            return { data: folder, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to update folder', code: 'UPDATE_ERROR' } };
          }
        }, {
          body: t.Object({
            name: t.String()
          })
        })
        .delete('/:id', async ({ params }): Promise<ApiResponse<any>> => {
          try {
            await this.folderService.deleteFolder(parseInt(params.id));
            return { data: { message: 'Folder deleted successfully' }, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to delete folder', code: 'DELETE_ERROR' } };
          }
        })
    );
  }

  fileRoutes(app: Elysia) {
    return app.group('/api/v1/files', (app) =>
      app
        .post('/', async ({ body }): Promise<ApiResponse<any>> => {
          try {
            const file = await this.folderService.createFile(body.name, body.folderId, body.size);
            return { data: file, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to create file', code: 'CREATE_FILE_ERROR' } };
          }
        }, {
          body: t.Object({
            name: t.String(),
            folderId: t.Number(),
            size: t.Optional(t.Number())
          })
        })
        .put('/:id', async ({ params, body }): Promise<ApiResponse<any>> => {
          try {
            const file = await this.folderService.updateFile(parseInt(params.id), body.name);
            return { data: file, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to update file', code: 'UPDATE_FILE_ERROR' } };
          }
        }, {
          body: t.Object({
            name: t.String()
          })
        })
        .delete('/:id', async ({ params }): Promise<ApiResponse<any>> => {
          try {
            await this.folderService.deleteFile(parseInt(params.id));
            return { data: { message: 'File deleted successfully' }, error: null };
          } catch (error) {
            return { data: null, error: { message: 'Failed to delete file', code: 'DELETE_FILE_ERROR' } };
          }
        })
    );
  }
}
