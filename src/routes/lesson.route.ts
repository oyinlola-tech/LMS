import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getLesson, getResources, updateProgress, completeLesson, getNotes, createNote, deleteNote, getBookmarks, createBookmark, deleteBookmark, getComments, createComment, getQuiz, submitQuiz } from '../controllers/lesson.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getLesson);

  fastify.get('/:id/resources', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getResources);

  fastify.put('/:id/progress', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, updateProgress);

  fastify.post('/:id/complete', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, completeLesson);

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getNotes);

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createNote);

  fastify.delete('/:id/notes/:noteId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteNote);

  fastify.get('/:id/bookmarks', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getBookmarks);

  fastify.post('/:id/bookmarks', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createBookmark);

  fastify.delete('/:id/bookmarks/:bookmarkId', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, deleteBookmark);

  fastify.get('/:id/comments', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getComments);

  fastify.post('/:id/comments', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, createComment);

  fastify.get('/:id/quiz', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, getQuiz);

  fastify.post('/:id/quiz/submit', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, submitQuiz);
}