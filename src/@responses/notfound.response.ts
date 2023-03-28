import { HttpStatus } from '@nestjs/common';

export interface NotFoundResponseOption {
  message?: string;
  payload?: object;
}

export class NotFoundResponse {
  public success?: boolean;
  public statusCode?: number;
  public message: string;
  public payload?: object;
  public meta?: object;

  constructor(option?: NotFoundResponseOption) {
    this.success = false;
    this.statusCode = HttpStatus.NO_CONTENT;
    this.payload = option?.payload || {};
    if (Array.isArray(option?.payload) && option?.payload.length == 0)
      this.message = option?.message || ' No data found or data deleted';
    else if (
      typeof option?.payload == 'object' &&
      Object.keys(option?.payload).length === 0
    ) {
      this.message = option?.message || ' No data found or data deleted';
    } else this.message = option?.message || ' success';
  }
}
