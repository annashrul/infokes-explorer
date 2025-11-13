import axios from 'axios';
import type { Folder, File, FolderWithContent, ApiResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000
});

// Helper function to handle API responses
const handleResponse = <T>(response: ApiResponse<T>): T => {
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data as T;
};

export const folderApi = {
  async getAllFolders(): Promise<Folder[]> {
    const { data } = await api.get<ApiResponse<Folder[]>>('/folders');
    return handleResponse(data);
  },

  async getSubfolders(parentId: number): Promise<Folder[]> {
    const { data } = await api.get<ApiResponse<Folder[]>>(`/folders/${parentId}/children`);
    return handleResponse(data);
  },

  async getFolderWithFiles(folderId: number): Promise<FolderWithContent> {
    const { data } = await api.get<ApiResponse<FolderWithContent>>(`/folders/${folderId}`);
    return handleResponse(data);
  },

  async searchFolders(query: string): Promise<Folder[]> {
    const { data } = await api.get<ApiResponse<Folder[]>>('/folders/search', { params: { q: query } });
    return handleResponse(data);
  },

  async createFolder(name: string, parentId?: number): Promise<Folder> {
    const { data } = await api.post<ApiResponse<Folder>>('/folders', { name, parentId });
    return handleResponse(data);
  },

  async updateFolder(id: number, name: string): Promise<Folder> {
    const { data } = await api.put<ApiResponse<Folder>>(`/folders/${id}`, { name });
    return handleResponse(data);
  },

  async deleteFolder(id: number): Promise<void> {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/folders/${id}`);
    handleResponse(data);
  },

  async createFile(name: string, folderId: number, size: number = 0): Promise<File> {
    const { data } = await api.post<ApiResponse<File>>('/files', { name, folderId, size });
    return handleResponse(data);
  },

  async updateFile(id: number, name: string): Promise<File> {
    const { data } = await api.put<ApiResponse<File>>(`/files/${id}`, { name });
    return handleResponse(data);
  },

  async deleteFile(id: number): Promise<void> {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/files/${id}`);
    handleResponse(data);
  }
};
