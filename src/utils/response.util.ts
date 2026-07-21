import type { FastifyReply } from 'fastify';

export function ok(reply: FastifyReply, data: unknown, message?: string): void {
  if (!reply) return;
  reply.status(200).send({ message, data });
}

export function created(reply: FastifyReply, data: unknown, message?: string): void {
  if (!reply) return;
  reply.status(201).send({ message, data });
}

export function error(
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  if (!reply) return;
  reply.status(status).send({
    error: { code, message, details },
  });
}
