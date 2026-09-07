import { PaginationMeta } from '@/common/pagination/pagination.meta';

export interface PaginationResponse<T> {
    data: T[];
    meta: PaginationMeta;
}