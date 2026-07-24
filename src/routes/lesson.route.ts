import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getLesson, getResources, updateProgress, completeLesson, getNotes, createNote, deleteNote, getBookmarks, createBookmark, deleteBookmark, getComments, createComment, getQuiz, submitQuiz } from '../controllers/lesson.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, getLesson);

  fastify.get('/:id/resources', { preHandler: [fastify.authenticate] }, getResources);

  fastify.put('/:id/progress', { preHandler: [fastify.authenticate] }, updateProgress);

  fastify.post('/:id/complete', { preHandler: [fastify.authenticate] }, completeLesson);

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate] }, getNotes);

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate] }, createNote);

  fastify.delete('/:id/notes/:noteId', { preHandler: [fastify.authenticate] }, deleteNote);

  fastify.get('/:id/bookmarks', { preHandler: [fastify.authenticate] }, getBookmarks);

  fastify.post('/:id/bookmarks', { preHandler: [fastify.authenticate] }, createBookmark);

  fastify.delete('/:id/bookmarks/:bookmarkId', { preHandler: [fastify.authenticate] }, deleteBookmark);

  fastify.get('/:id/comments', { preHandler: [fastify.authenticate] }, getComments);

  fastify.post('/:id/comments', { preHandler: [fastify.authenticate] }, createComment);

  fastify.get('/:id/quiz', { preHandler: [fastify.authenticate] }, getQuiz);

  fastify.post('/:id/quiz/submit', { preHandler: [fastify.authenticate] }, submitQuiz);
}
