import { MetaDataInterface } from '../interfaces/meta-data.interface';

export function generatePaginationMeta(
  total: number,
  page: number,
  limit: number,
): MetaDataInterface {
  const totalPage = Math.ceil(total / limit);
  const nextPage = page < totalPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    pageSize: limit,
    currentPage: page,
    total,
    totalPage,
    nextPage,
    prevPage,
  };
}
