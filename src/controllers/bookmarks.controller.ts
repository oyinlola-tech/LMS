import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { LessonBookmark, PostBookmark } from '../models';

export async function listBookmarks(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user!.sub;
    const [lessonBookmarks, postBookmarks] = await Promise.all([
      LessonBookmark.findAll({
        where: { UserId: userId },
        include: [{ model: require('../models').Lesson, attributes: ['id', 'title'], include: [{ model: require('../models').Course, attributes: ['id', 'title'] }] }],
      }),
      PostBookmark.findAll({
        where: { userId: userId },
        include: [{ model: require('../models').Post, attributes: ['id', 'title', 'content', 'slug'] }],
      }),
    ]);

    const items = [
      ...lessonBookmarks.map((b: any) => ({
        id: b.id,
        type: 'lesson',
        title: b.Lesson?.title || 'Lesson',
        description: b.Lesson?.Course?.title || '',
        url: '/course/' + b.Lesson?.CourseId + '/lesson/' + b.LessonId,
      })),
      ...postBookmarks.map((b: any) => ({
        id: b.id,
        type: 'article',
        title: b.Post?.title || 'Article',
        description: (b.Post?.content || '').substring(0, 120),
        url: '/blog/' + (b.Post?.slug || b.PostId),
      })),
    ];

    return ok(reply, items, 'Bookmarks loaded');
  } catch (err) {
    return error(reply, 500, 'BOOKMARKS_FAILED', 'Failed to load bookmarks');
  }
}

export async function deleteBookmark(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = request.user!.sub;
    const bookmark = await LessonBookmark.findByPk(id);
    if (bookmark && (bookmark as any).UserId === userId) {
      await bookmark.destroy();
      return ok(reply, null, 'Bookmark removed');
    }
    const postBookmark = await PostBookmark.findByPk(id);
    if (postBookmark && (postBookmark as any).userId === userId) {
      await postBookmark.destroy();
      return ok(reply, null, 'Bookmark removed');
    }
    return error(reply, 404, 'NOT_FOUND', 'Bookmark not found');
  } catch (err) {
    return error(reply, 500, 'BOOKMARK_DELETE_FAILED', 'Failed to remove bookmark');
  }
}
