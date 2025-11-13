import type { IFolderRepository } from '@/domain/IFolderRepository';
import type { Folder, File } from '@/domain/Folder';
import { pool } from '@/infrastructure/database';
import type { RowDataPacket } from 'mysql2';

export class FolderRepository implements IFolderRepository {
  async findAll(): Promise<Folder[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM folders ORDER BY name'
    );
    return rows as Folder[];
  }

  async findById(id: number): Promise<Folder | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM folders WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Folder) : null;
  }

  async findByParentId(parentId: number | null): Promise<Folder[]> {
    const query = parentId === null
      ? 'SELECT id, name, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM folders WHERE parent_id IS NULL ORDER BY name'
      : 'SELECT id, name, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM folders WHERE parent_id = ? ORDER BY name';
    
    const [rows] = parentId === null
      ? await pool.query<RowDataPacket[]>(query)
      : await pool.query<RowDataPacket[]>(query, [parentId]);
    
    return rows as Folder[];
  }

  async findFilesByFolderId(folderId: number): Promise<File[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, folder_id as folderId, size, created_at as createdAt, updated_at as updatedAt FROM files WHERE folder_id = ? ORDER BY name',
      [folderId]
    );
    return rows as File[];
  }

  async search(query: string): Promise<Folder[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, parent_id as parentId, created_at as createdAt, updated_at as updatedAt FROM folders WHERE name LIKE ? ORDER BY name LIMIT 100',
      [`%${query}%`]
    );
    return rows as Folder[];
  }

  async create(folder: { name: string; parentId: number | null }): Promise<Folder> {
    const [result] = await pool.query(
      'INSERT INTO folders (name, parent_id) VALUES (?, ?)',
      [folder.name, folder.parentId]
    );
    const insertId = (result as any).insertId;
    const created = await this.findById(insertId);
    if (!created) {
      throw new Error('Failed to create folder');
    }
    return created;
  }

  async update(id: number, folder: { name: string }): Promise<Folder | null> {
    await pool.query(
      'UPDATE folders SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [folder.name, id]
    );
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    // Delete all files in this folder first
    await pool.query('DELETE FROM files WHERE folder_id = ?', [id]);
    
    // Delete all subfolders recursively
    const subfolders = await this.findByParentId(id);
    for (const subfolder of subfolders) {
      await this.delete(subfolder.id);
    }
    
    // Finally delete the folder itself
    await pool.query('DELETE FROM folders WHERE id = ?', [id]);
  }

  async createFile(file: { name: string; folderId: number; size?: number }): Promise<File> {
    const [result] = await pool.query(
      'INSERT INTO files (name, folder_id, size) VALUES (?, ?, ?)',
      [file.name, file.folderId, file.size || 0]
    );
    const insertId = (result as any).insertId;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, folder_id as folderId, size, created_at as createdAt, updated_at as updatedAt FROM files WHERE id = ?',
      [insertId]
    );
    return rows[0] as File;
  }

  async updateFile(id: number, file: { name: string }): Promise<File | null> {
    await pool.query(
      'UPDATE files SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [file.name, id]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, folder_id as folderId, size, created_at as createdAt, updated_at as updatedAt FROM files WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as File) : null;
  }

  async deleteFile(id: number): Promise<void> {
    await pool.query('DELETE FROM files WHERE id = ?', [id]);
  }
}
