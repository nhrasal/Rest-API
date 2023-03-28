import { SuccessResponse, SuccessResponseOption } from './success.response';

export interface FindAllSuccessResponseOption extends SuccessResponseOption {
  take: number | string;
  page: number | boolean;
  total: number;
}
export interface PageInfo {
  take: number | string;
  skip: number | boolean;
  page: number | boolean;
  total: number | boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export class FindAllSuccessResponse extends SuccessResponse {
  public pageInfo: PageInfo = {
    take: 0,
    skip: 0,
    page: 1,
    total: 0,
    hasNext: false,
    hasPrevious: false,
  };

  constructor(option: FindAllSuccessResponseOption) {
    super(option);
    this.pageInfo.take = option.take;

    if (this.pageInfo.take === 'all') {
      this.pageInfo.skip = false;
      this.pageInfo.page = false;
    } else {
      this.pageInfo.page = Number(option.page) ? Number(option.page) : 1;
      this.pageInfo.take = Number(option.take) ? Number(option.take) : 10;
      this.pageInfo.skip =
        this.pageInfo.page === 1
          ? 0
          : (this.pageInfo.page - 1) * this.pageInfo.take;
      this.pageInfo.hasNext =
        this.pageInfo.page * this.pageInfo.take < option.total;
      this.pageInfo.hasPrevious = this.pageInfo.page > 1;
    }
    this.pageInfo.total = option.total;
  }
}
