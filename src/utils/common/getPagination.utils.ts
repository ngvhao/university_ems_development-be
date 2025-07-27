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
    pageSize: Number(limit),
    currentPage: Number(page),
    total: Number(total),
    totalPage: Number(totalPage),
    nextPage,
    prevPage,
  };
}
