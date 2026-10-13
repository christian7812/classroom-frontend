export type Department = {
  id: number;
  code: string;
  name: string;
  description: string;
  createdAt: string;
};

export type NewDepartment = {
  code: string;
  name: string;
  description?: string;
};

export type UpdateDepartment = Partial<NewDepartment>;

export type Subject = {
  id: number;
  code: string;
  name: string;
  description: string;
  /** Department code returned by GET /api/subjects. */
  department: string;
  createdAt: string;
};

export type NewSubject = {
  code: string;
  name: string;
  description?: string;
  departmentId: number;
};

export type UpdateSubject = Partial<NewSubject>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type SubjectListQuery = {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
};