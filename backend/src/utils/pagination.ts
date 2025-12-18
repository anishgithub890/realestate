export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const parsePagination = (params: PaginationParams): PaginationResult => {
  const page = Math.max(1, parseInt(String(params.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || 10), 10)));
  const skip = (page - 1) * limit;
  const sortBy = params.sortBy || 'created_at';
  const sortOrder = params.sortOrder || 'desc';

  return {
    skip,
    take: limit,
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

export const buildOrderBy = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  return {
    [sortBy]: sortOrder,
  };
};

