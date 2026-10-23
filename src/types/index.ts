export type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
};

export type SubjectRecord = Omit<Subject, "description"> & {
  description: string | null;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
};

export type Department = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubjectInput = {
  name: string;
  code: string;
  description?: string | null;
  departmentId: number;
};

export type CreateDepartmentInput = {
  name: string;
  code: string;
  description?: string | null;
};

export type ListResponse<T = unknown> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateResponse<T = unknown> = {
  data: T;
};

export type GetOneResponse<T = unknown> = {
  data: T;
};

export type ApiErrorResponse = {
  error: string;
};
