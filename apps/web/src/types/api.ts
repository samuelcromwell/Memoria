export type User = {
  id: number;
  email: string;
  displayName: string | null;
  hasPassword: boolean;
  createdAt: string;
};

export type StoredFile = {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TagStat = {
  name: string;
  count: number;
};

export type FileTypeStat = {
  name: string;
  count: number;
};

export type DashboardStats = {
  totalFiles: number;
  totalStorageBytes: number;
  totalStorageFormatted: string;
  mostUsedTags: TagStat[];
  fileTypes: FileTypeStat[];
  recentUploads: StoredFile[];
};
