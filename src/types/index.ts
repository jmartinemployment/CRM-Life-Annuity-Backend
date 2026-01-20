export * from './party.types';
export * from './holding.types';
export * from './activity.types';
export * from './relation.types';
export * from './coverage.types';
export * from './auth.types';
export * from './acord.types';

// Shared pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
