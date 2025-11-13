// Import and re-export shared types
import type {
  Folder,
  File,
  FolderWithContent,
  CreateFolderDto,
  UpdateFolderDto,
  CreateFileDto,
  UpdateFileDto,
} from '@packages/shared/types';

export type {
  Folder,
  File,
  FolderWithContent,
  CreateFolderDto,
  UpdateFolderDto,
  CreateFileDto,
  UpdateFileDto,
};

// Domain-specific extensions if needed
export interface FolderTree extends Folder {
  children?: FolderTree[];
}