/**
 * Generic API envelope and pagination helpers.
 * The backend wraps every successful response in this shape.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface IncidentFilterParams extends PaginationParams {
  status?: string | string[];
  priority?: string | string[];
  category?: string;
  source?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
}
