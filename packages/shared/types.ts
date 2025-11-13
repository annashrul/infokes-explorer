// Shared types untuk backend dan frontend

export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  hasChildren?: boolean;
  children?: Folder[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface File {
  id: number;
  name: string;
  folderId: number;
  size: number;
  mimeType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FolderWithContent {
  folder: Folder | null;
  subfolders: Folder[];
  files: File[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// DTOs untuk API requests
export interface CreateFolderDto {
  name: string;
  parentId?: number;
}

export interface UpdateFolderDto {
  name: string;
}

export interface CreateFileDto {
  name: string;
  folderId: number;
  size?: number;
  mimeType?: string;
}

export interface UpdateFileDto {
  name: string;
}