import { Request } from 'express';

/**
 * Request with typed ID parameter
 */
export interface IdParamRequest extends Request {
  params: {
    id: string;
  };
}

/**
 * Request with typed ID parameter and typed body
 */
export interface IdParamBodyRequest<T> extends Request {
  params: {
    id: string;
  };
  body: T;
}
