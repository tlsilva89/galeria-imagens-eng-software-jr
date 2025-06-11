export interface Gallery {
  id: string;
  title: string;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GalleryResponse {
  galleries: Gallery[];
  pagination: PaginationInfo;
}
