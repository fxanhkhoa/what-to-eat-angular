export type BaseType = {
  _id: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

export type MultiLanguage<T> = {
  lang: string;
  data: T;
};

export type APIPagination<T> = {
  data: Array<T>;
  count: number;
};

export type PagingDto = {
  page?: number;
  limit?: number;
};
