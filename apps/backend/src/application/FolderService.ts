import type { IFolderRepository } from '@/domain/IFolderRepository';
import type { Folder, FolderTree, File } from '@/domain/Folder';

export class FolderService {
  constructor(private folderRepository: IFolderRepository) {}

  async getAllFoldersAsTree(): Promise<FolderTree[]> {
    const folders = await this.folderRepository.findAll();
    return this.buildTree(folders, null);
  }

  async getDirectSubfolders(parentId: number): Promise<Folder[]> {
    return this.folderRepository.findByParentId(parentId);
  }

  async getFolderWithFiles(folderId: number): Promise<{ folder: Folder | null; subfolders: Folder[]; files: File[] }> {
    const [folder, subfolders, files] = await Promise.all([
      this.folderRepository.findById(folderId),
      this.folderRepository.findByParentId(folderId),
      this.folderRepository.findFilesByFolderId(folderId)
    ]);

    return { folder, subfolders, files };
  }

  async searchFolders(query: string): Promise<Folder[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.folderRepository.search(query.trim());
  }

  async createFolder(name: string, parentId: number | null = null): Promise<Folder> {
    return this.folderRepository.create({ name, parentId });
  }

  async updateFolder(id: number, name: string): Promise<Folder | null> {
    return this.folderRepository.update(id, { name });
  }

  async deleteFolder(id: number): Promise<void> {
    return this.folderRepository.delete(id);
  }

  async createFile(name: string, folderId: number, size: number = 0): Promise<File> {
    return this.folderRepository.createFile({ name, folderId, size });
  }

  async updateFile(id: number, name: string): Promise<File | null> {
    return this.folderRepository.updateFile(id, { name });
  }

  async deleteFile(id: number): Promise<void> {
    return this.folderRepository.deleteFile(id);
  }

  private buildTree(folders: Folder[], parentId: number | null): FolderTree[] {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: this.buildTree(folders, folder.id)
      }));
  }
}
