import type { Folder, File } from '@/domain/Folder';

export interface IFolderRepository {
  findAll(): Promise<Folder[]>;
  findById(id: number): Promise<Folder | null>;
  findByParentId(parentId: number | null): Promise<Folder[]>;
  findFilesByFolderId(folderId: number): Promise<File[]>;
  search(query: string): Promise<Folder[]>;
  create(folder: { name: string; parentId: number | null }): Promise<Folder>;
  update(id: number, folder: { name: string }): Promise<Folder | null>;
  delete(id: number): Promise<void>;
  createFile(file: { name: string; folderId: number; size?: number }): Promise<File>;
  updateFile(id: number, file: { name: string }): Promise<File | null>;
  deleteFile(id: number): Promise<void>;
}
