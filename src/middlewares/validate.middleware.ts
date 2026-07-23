import type { FastifyRequest, FastifyReply } from 'fastify';

type ValidationRule = {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
};

export function validateBody(rules: ValidationRule[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = request.body as Record<string, any>;
    if (!body || typeof body !== 'object') {
      reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Request body is required' } });
      return;
    }

    for (const rule of rules) {
      const value = body[rule.field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} is required` },
        });
        return;
      }
      if (value === undefined || value === null) continue;
      if (rule.type === 'array' && !Array.isArray(value)) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be an array` },
        });
        return;
      }
      if (rule.type !== 'array' && typeof value !== rule.type) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be of type ${rule.type}` },
        });
        return;
      }
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at least ${rule.min} characters` },
          });
          return;
        }
        if (rule.max !== undefined && value.length > rule.max) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at most ${rule.max} characters` },
          });
          return;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} format is invalid` },
          });
          return;
        }
      }
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at least ${rule.min}` },
          });
          return;
        }
        if (rule.max !== undefined && value > rule.max) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at most ${rule.max}` },
          });
          return;
        }
      }
    }
  };
}

export function validateParams(rules: ValidationRule[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as Record<string, any>;
    for (const rule of rules) {
      const value = params[rule.field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} is required` },
        });
        return;
      }
      if (value === undefined || value === null) continue;
      if (rule.type === 'array' && !Array.isArray(value)) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be an array` },
        });
        return;
      }
      if (rule.type !== 'array' && typeof value !== rule.type) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be of type ${rule.type}` },
        });
        return;
      }
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at least ${rule.min} characters` },
          });
          return;
        }
        if (rule.max !== undefined && value.length > rule.max) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at most ${rule.max} characters` },
          });
          return;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} format is invalid` },
          });
          return;
        }
      }
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at least ${rule.min}` },
          });
          return;
        }
        if (rule.max !== undefined && value > rule.max) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at most ${rule.max}` },
          });
          return;
        }
      }
    }
  };
}

export function validateQuery(rules: ValidationRule[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as Record<string, any>;
    for (const rule of rules) {
      const value = query[rule.field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} is required` },
        });
        return;
      }
      if (value === undefined || value === null) continue;
      if (rule.type === 'array' && !Array.isArray(value)) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be an array` },
        });
        return;
      }
      if (rule.type !== 'array' && typeof value !== rule.type) {
        reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be of type ${rule.type}` },
        });
        return;
      }
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at least ${rule.min} characters` },
          });
          return;
        }
        if (rule.max !== undefined && value.length > rule.max) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at most ${rule.max} characters` },
          });
          return;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} format is invalid` },
          });
          return;
        }
      }
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at least ${rule.min}` },
          });
          return;
        }
        if (rule.max !== undefined && value > rule.max) {
          reply.status(400).send({
            error: { code: 'VALIDATION_ERROR', message: rule.message || `${rule.field} must be at most ${rule.max}` },
          });
          return;
        }
      }
    }
  };
}
