export interface SuccessResponseOption {
  statusCode?: number;
  message?: string;
  // devMessage?: string;
  payload: object;
  meta?: object;
}

export class SuccessResponse {
  public success?: boolean;
  public statusCode?: number;
  public message: string;
  // public devMessage?: string;
  // public data: object;
  public payload?: object;
  public meta?: object;

  constructor(option: SuccessResponseOption) {
    this.success = true;
    this.statusCode = option.statusCode || 200;
    this.payload = option.payload;
    if (Array.isArray(option.payload) && option.payload.length == 0)
      this.message = option.message || ' No data found or data deleted';
    else if (
      typeof option.payload == 'object' &&
      Object.keys(option.payload).length === 0
    ) {
      this.message = option.message || ' No data found or data deleted';
    } else this.message = option.message || ' success';

    if (option.meta) this.meta = option.meta;
  }
}
