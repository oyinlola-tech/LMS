import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { getLessonDetailQuery } from '../services/lesson/queries/getLessonDetail.query';
import { getLessonResourcesQuery } from '../services/lesson/queries/getLessonResources.query';
import { getLessonNotesQuery } from '../services/lesson/queries/getLessonNotes.query';
import { getLessonBookmarksQuery } from '../services/lesson/queries/getLessonBookmarks.query';
import { getLessonCommentsQuery } from '../services/lesson/queries/getLessonComments.query';
import { getLessonQuizQuery } from '../services/lesson/queries/getLessonQuiz.query';
import { updateLessonProgressCommand } from '../services/lesson/commands/updateLessonProgress.command';
import { markLessonCompleteCommand } from '../services/lesson/commands/markLessonComplete.command';
import { addLessonNoteCommand } from '../services/lesson/commands/addLessonNote.command';
import { deleteLessonNoteCommand } from '../services/lesson/commands/deleteLessonNote.command';
import { addLessonBookmarkCommand } from '../services/lesson/commands/addLessonBookmark.command';
import { removeLessonBookmarkCommand } from '../services/lesson/commands/removeLessonBookmark.command';
import { addLessonCommentCommand } from '../services/lesson/commands/addLessonComment.command';
import { submitQuizCommand } from '../services/lesson/commands/submitQuiz.command';
import { AppError } from '../errors';
import {
  validateProgressInput,
  validateNoteInput,
  validateBookmarkInput,
  validateCommentInput,
  validateQuizSubmit,
} from '../validators/lesson.validator';
import type { IdParams, IdNoteIdParams, IdBookmarkIdParams, LessonUpdateProgressBody, CreateNoteBody, CreateBookmarkBody, CreateLessonCommentBody, SubmitQuizBody } from '../types';

const handleError = (reply: FastifyReply, err: unknown, fallbackCode: string, fallbackMsg: string) => {
  if (err instanceof AppError && err.code === 'NOT_FOUND') return error(reply, 404, err.code, err.message);
  if (err instanceof AppError && err.code === 'FORBIDDEN') return error(reply, 403, err.code, err.message);
  return error(reply, 500, fallbackCode, fallbackMsg);
};

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getLessonDetailQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Lesson loaded');
    } catch (err: unknown) {
      return handleError(reply, err, 'LESSON_LOAD_FAILED', 'Failed to load lesson');
    }
  });

  fastify.get('/:id/resources', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getLessonResourcesQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Resources loaded');
    } catch (err: unknown) {
      return handleError(reply, err, 'RESOURCES_FAILED', 'Failed to load resources');
    }
  });

  fastify.put('/:id/progress', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as LessonUpdateProgressBody;
    const validation = validateProgressInput(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      await updateLessonProgressCommand.execute({
        lessonId: id,
        userId: request.user!.sub,
        userRole: request.user!.role,
        progressPercent: body.progressPercent,
        lastPositionSeconds: body.lastPositionSeconds,
        minutesSpent: body.minutesSpent,
      });
      return ok(reply, null, 'Progress updated');
    } catch (err: unknown) {
      return handleError(reply, err, 'LESSON_PROGRESS_FAILED', 'Failed to update progress');
    }
  });

  fastify.post('/:id/complete', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      await markLessonCompleteCommand.execute(id, request.user!.sub, request.user!.role);
      return created(reply, null, 'Lesson completed');
    } catch (err: unknown) {
      return handleError(reply, err, 'LESSON_COMPLETE_FAILED', 'Failed to complete lesson');
    }
  });

  fastify.get('/:id/notes', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getLessonNotesQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Notes loaded');
    } catch (err: unknown) {
      return handleError(reply, err, 'NOTES_LOAD_FAILED', 'Failed to load notes');
    }
  });

  fastify.post('/:id/notes', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as CreateNoteBody;
    const validation = validateNoteInput(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await addLessonNoteCommand.execute({
        lessonId: id,
        userId: request.user!.sub,
        userRole: request.user!.role,
        content: body.content,
        timestampSeconds: body.timestampSeconds,
      });
      return created(reply, result, 'Note created');
    } catch (err: unknown) {
      return handleError(reply, err, 'NOTE_CREATE_FAILED', 'Failed to create note');
    }
  });

  fastify.delete('/:id/notes/:noteId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id, noteId } = request.params as IdNoteIdParams;
      await deleteLessonNoteCommand.execute(id, noteId, request.user!.sub, request.user!.role);
      return ok(reply, null, 'Note deleted');
    } catch (err: unknown) {
      return handleError(reply, err, 'NOTE_DELETE_FAILED', 'Failed to delete note');
    }
  });

  fastify.get('/:id/bookmarks', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getLessonBookmarksQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Bookmarks loaded');
    } catch (err: unknown) {
      return handleError(reply, err, 'BOOKMARKS_LOAD_FAILED', 'Failed to load bookmarks');
    }
  });

  fastify.post('/:id/bookmarks', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as CreateBookmarkBody;
    const validation = validateBookmarkInput(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await addLessonBookmarkCommand.execute({
        lessonId: id,
        userId: request.user!.sub,
        userRole: request.user!.role,
        note: body.note,
        timestampSeconds: body.timestampSeconds,
      });
      return created(reply, result, 'Bookmark created');
    } catch (err: unknown) {
      return handleError(reply, err, 'BOOKMARK_CREATE_FAILED', 'Failed to create bookmark');
    }
  });

  fastify.delete('/:id/bookmarks/:bookmarkId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id, bookmarkId } = request.params as IdBookmarkIdParams;
      await removeLessonBookmarkCommand.execute(id, bookmarkId, request.user!.sub, request.user!.role);
      return ok(reply, null, 'Bookmark deleted');
    } catch (err: unknown) {
      return handleError(reply, err, 'BOOKMARK_DELETE_FAILED', 'Failed to delete bookmark');
    }
  });

  fastify.get('/:id/comments', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getLessonCommentsQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Comments loaded');
    } catch (err: unknown) {
      return handleError(reply, err, 'LESSON_COMMENTS_FAILED', 'Failed to load comments');
    }
  });

  fastify.post('/:id/comments', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as CreateLessonCommentBody;
    const validation = validateCommentInput(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await addLessonCommentCommand.execute({
        lessonId: id,
        userId: request.user!.sub,
        userRole: request.user!.role,
        content: body.content,
      });
      return created(reply, result, 'Comment posted');
    } catch (err: unknown) {
      return handleError(reply, err, 'LESSON_COMMENT_FAILED', 'Failed to post comment');
    }
  });

  fastify.get('/:id/quiz', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as IdParams;
      const result = await getLessonQuizQuery.execute(id, request.user!.sub, request.user!.role);
      return ok(reply, result, 'Quiz loaded');
    } catch (err: unknown) {
      return handleError(reply, err, 'QUIZ_LOAD_FAILED', 'Failed to load quiz');
    }
  });

  fastify.post('/:id/quiz/submit', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as SubmitQuizBody;
    const validation = validateQuizSubmit(body as Record<string, any>);
    if (!validation.valid) {
      return error(reply, 400, 'VALIDATION_ERROR', validation.errors.join(', '));
    }
    try {
      const { id } = request.params as IdParams;
      const result = await submitQuizCommand.execute({
        lessonId: id,
        userId: request.user!.sub,
        userRole: request.user!.role,
        attemptId: body.attemptId,
        answers: Object.entries(body.answers || {}).map(([questionId, optionId]) => ({ questionId, optionId })),
        userEmail: request.user!.email,
      });
      return ok(reply, result, 'Quiz submitted');
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'ALREADY_SUBMITTED') {
        return error(reply, 409, err.code, err.message);
      }
      return handleError(reply, err, 'QUIZ_SUBMIT_FAILED', 'Failed to submit quiz');
    }
  });
}
