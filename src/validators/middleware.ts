import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware factory
 * Creates middleware that validates request body, query, or params against a Zod schema
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validated = schema.parse(data);
      
      // Replace the source with validated/transformed data
      if (source === 'body') {
        req.body = validated;
      } else if (source === 'query') {
        req.query = validated;
      } else {
        req.params = validated;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Validate multiple sources at once
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Array<{ field: string; message: string; code: string; source: string }> = [];
      
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
              source: 'body',
            })));
          }
        }
      }
      
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
              source: 'query',
            })));
          }
        }
      }
      
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
              source: 'params',
            })));
          }
        }
      }
      
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
        return;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
