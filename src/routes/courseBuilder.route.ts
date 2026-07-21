import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';
import { Lesson, LessonResource } from '../models';
import { createCourseCommand } from '../services/courseBuilder/commands/createCourse.command';
import { updateCourseCommand } from '../services/courseBuilder/commands/updateCourse.command';
import { publishCourseCommand } from '../services/courseBuilder/commands/publishCourse.command';
import { unpublishCourseCommand } from '../services/courseBuilder/commands/unpublishCourse.command';
import { createModuleCommand } from '../services/courseBuilder/commands/createModule.command';
import { updateModuleCommand } from '../services/courseBuilder/commands/updateModule.command';
import { deleteModuleCommand } from '../services/courseBuilder/commands/deleteModule.command';
import { reorderModulesCommand } from '../services/courseBuilder/commands/reorderModules.command';
import { createLessonCommand } from '../services/courseBuilder/commands/createLesson.command';
import { updateLessonCommand } from '../services/courseBuilder/commands/updateLesson.command';
import { deleteLessonCommand } from '../services/courseBuilder/commands/deleteLesson.command';
import { reorderLessonsCommand } from '../services/courseBuilder/commands/reorderLessons.command';
import { createAssignmentCommand } from '../services/courseBuilder/commands/createAssignment.command';
import { updateAssignmentCommand } from '../services/courseBuilder/commands/updateAssignment.command';
import { deleteAssignmentCommand } from '../services/courseBuilder/commands/deleteAssignment.command';
import { createQuizCommand } from '../services/courseBuilder/commands/createQuiz.command';
import { createCouponCommand } from '../services/courseBuilder/commands/createCoupon.command';
import { applyCouponCommand } from '../services/courseBuilder/commands/applyCoupon.command';
import { addLessonContentCommand } from '../services/courseBuilder/commands/addLessonContent.command';
import { setLessonMediaUrlCommand } from '../services/courseBuilder/commands/setLessonMediaUrl.command';
import { getTutorCoursesQuery } from '../services/courseBuilder/queries/getTutorCourses.query';
import { getCourseDetailQuery } from '../services/courseBuilder/queries/getCourseDetail.query';
import { getCoursePreviewQuery } from '../services/courseBuilder/queries/getCoursePreview.query';
import { getEnrollmentPreviewQuery } from '../services/courseBuilder/queries/getEnrollmentPreview.query';

const publicBaseUrl = process.env.PUBLIC_BASE_URL;

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const course = await createCourseCommand.execute(request.user!.sub, (request.body as any) || {});
      return created(reply, course, 'Course draft created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COURSE_CREATE_FAILED', err.message || 'Failed to create course');
    }
  });

  fastify.get('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const courses = await getTutorCoursesQuery.execute(request.user!.sub);
      return ok(reply, courses, 'Courses loaded');
    } catch (err: any) {
      return error(reply, 500, 'COURSE_LIST_FAILED', 'Failed to load courses');
    }
  });

  fastify.get('/courses/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const course = await getCourseDetailQuery.execute((request.params as any).id, request.user!.sub);
      if (!course) return error(reply, 404, 'NOT_FOUND', 'Course not found');
      return ok(reply, course, 'Course loaded');
    } catch (err: any) {
      return error(reply, 500, 'COURSE_LOAD_FAILED', 'Failed to load course');
    }
  });

  fastify.put('/courses/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const course = await updateCourseCommand.execute((request.params as any).id, request.user!.sub, (request.body as any) || {});
      return ok(reply, course, 'Course updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COURSE_UPDATE_FAILED', err.message || 'Failed to update course');
    }
  });

  fastify.post('/courses/:id/cover', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const uploadedFile = (request as any).uploadedFile;
      if (!publicBaseUrl || !uploadedFile) return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
      const course = await updateCourseCommand.execute((request.params as any).id, request.user!.sub, { thumbnailUrl: `${publicBaseUrl}/uploads/${uploadedFile.filename}` });
      return ok(reply, { thumbnailUrl: course.thumbnailUrl }, 'Cover updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COVER_UPLOAD_FAILED', err.message || 'Failed to upload cover');
    }
  });

  fastify.post('/courses/:id/modules', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const courseSection = await createModuleCommand.execute((request.params as any).id, request.user!.sub, (request.body as any) || {});
      return created(reply, courseSection, 'Module created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'MODULE_CREATE_FAILED', err.message || 'Failed to create module');
    }
  });

  fastify.put('/modules/:moduleId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const courseSection = await updateModuleCommand.execute((request.params as any).moduleId, request.user!.sub, (request.body as any) || {});
      return ok(reply, courseSection, 'Module updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'MODULE_UPDATE_FAILED', err.message || 'Failed to update module');
    }
  });

  fastify.delete('/modules/:moduleId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await deleteModuleCommand.execute((request.params as any).moduleId, request.user!.sub);
      return ok(reply, null, 'Module deleted');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'MODULE_DELETE_FAILED', err.message || 'Failed to delete module');
    }
  });

  fastify.put('/courses/:id/modules/reorder', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { order } = (request.body as Record<string, any>) || {};
      if (!Array.isArray(order)) return error(reply, 400, 'VALIDATION_ERROR', 'order must be an array');
      await reorderModulesCommand.execute((request.params as any).id, request.user!.sub, order);
      return ok(reply, null, 'Modules reordered');
    } catch (err: any) {
      return error(reply, 500, 'MODULE_REORDER_FAILED', 'Failed to reorder modules');
    }
  });

  fastify.post('/modules/:moduleId/lessons', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lesson = await createLessonCommand.execute((request.params as any).moduleId, request.user!.sub, (request.body as any) || {});
      return created(reply, lesson, 'Lesson created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LESSON_CREATE_FAILED', err.message || 'Failed to create lesson');
    }
  });

  fastify.put('/lessons/:lessonId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lesson = await updateLessonCommand.execute((request.params as any).lessonId, request.user!.sub, (request.body as any) || {});
      return ok(reply, lesson, 'Lesson updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LESSON_UPDATE_FAILED', err.message || 'Failed to update lesson');
    }
  });

  fastify.delete('/lessons/:lessonId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await deleteLessonCommand.execute((request.params as any).lessonId, request.user!.sub);
      return ok(reply, null, 'Lesson deleted');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LESSON_DELETE_FAILED', err.message || 'Failed to delete lesson');
    }
  });

  fastify.put('/modules/:moduleId/lessons/reorder', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { order } = (request.body as Record<string, any>) || {};
      if (!Array.isArray(order)) return error(reply, 400, 'VALIDATION_ERROR', 'order must be an array');
      await reorderLessonsCommand.execute((request.params as any).moduleId, request.user!.sub, order);
      return ok(reply, null, 'Lessons reordered');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LESSON_REORDER_FAILED', err.message || 'Failed to reorder lessons');
    }
  });

  fastify.post('/lessons/:lessonId/content', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const block = await addLessonContentCommand.execute((request.params as any).lessonId, request.user!.sub, (request.body as any) || {});
      return created(reply, block, 'Lesson content added');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LESSON_CONTENT_FAILED', err.message || 'Failed to add lesson content');
    }
  });

  fastify.post('/lessons/:lessonId/media', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const uploadedFile = (request as any).uploadedFile;
      if (!publicBaseUrl || !uploadedFile) return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
      const ext = path.extname(uploadedFile.filename).replace('.', '').toLowerCase();
      const fileUrl = `${publicBaseUrl}/uploads/${uploadedFile.filename}`;

      if (ext === 'mp4') {
        const url = await setLessonMediaUrlCommand.execute((request.params as any).lessonId, request.user!.sub, fileUrl);
        return ok(reply, { videoUrl: url }, 'Video uploaded');
      }

      if (ext === 'pdf') {
        const resource = await LessonResource.create({
          LessonId: (request.params as any).lessonId,
          title: 'PDF',
          resourceUrl: fileUrl,
          fileType: 'pdf',
          fileSizeMb: uploadedFile.file.size / (1024 * 1024),
        });
        return created(reply, resource, 'PDF uploaded');
      }

      if (ext === 'md' || ext === 'txt') {
        const resource = await LessonResource.create({
          LessonId: (request.params as any).lessonId,
          title: 'Notes',
          resourceUrl: fileUrl,
          fileType: ext,
          fileSizeMb: uploadedFile.file.size / (1024 * 1024),
        });
        return created(reply, resource, 'Notes uploaded');
      }

      return error(reply, 400, 'VALIDATION_ERROR', 'Unsupported file type');
    } catch (err: any) {
      return error(reply, 500, 'LESSON_MEDIA_FAILED', 'Failed to upload media');
    }
  });

  fastify.post('/lessons/:lessonId/resources', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const uploadedFile = (request as any).uploadedFile;
      if (!publicBaseUrl || !uploadedFile) return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
      const ext = path.extname(uploadedFile.filename).replace('.', '').toLowerCase();
      if (ext === 'mp4') return error(reply, 400, 'VALIDATION_ERROR', 'Video uploads must use /media');

      const fileUrl = `${publicBaseUrl}/uploads/${uploadedFile.filename}`;
      const resource = await LessonResource.create({
        LessonId: (request.params as any).lessonId,
        title: (request.body as any)?.title || 'Resource',
        resourceUrl: fileUrl,
        fileType: ext || 'file',
        fileSizeMb: uploadedFile.file.size / (1024 * 1024),
      });
      return created(reply, resource, 'Resource uploaded');
    } catch (err: any) {
      return error(reply, 500, 'RESOURCE_UPLOAD_FAILED', 'Failed to upload resource');
    }
  });

  fastify.put('/lessons/:lessonId/media-url', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { url } = (request.body as Record<string, any>) || {};
      const result = await setLessonMediaUrlCommand.execute((request.params as any).lessonId, request.user!.sub, url);
      return ok(reply, { videoUrl: result }, 'Video URL set');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'LESSON_MEDIA_FAILED', err.message || 'Failed to set media URL');
    }
  });

  fastify.post('/courses/:id/assignments', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const assignment = await createAssignmentCommand.execute((request.params as any).id, request.user!.sub, (request.body as any) || {});
      return created(reply, assignment, 'Assignment created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ASSIGNMENT_CREATE_FAILED', err.message || 'Failed to create assignment');
    }
  });

  fastify.put('/assignments/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const assignment = await updateAssignmentCommand.execute((request.params as any).id, request.user!.sub, (request.body as any) || {});
      return ok(reply, assignment, 'Assignment updated');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ASSIGNMENT_UPDATE_FAILED', err.message || 'Failed to update assignment');
    }
  });

  fastify.delete('/assignments/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await deleteAssignmentCommand.execute((request.params as any).id, request.user!.sub);
      return ok(reply, null, 'Assignment deleted');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'ASSIGNMENT_DELETE_FAILED', err.message || 'Failed to delete assignment');
    }
  });

  fastify.post('/courses/:id/publish', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await publishCourseCommand.execute((request.params as any).id, request.user!.sub);
      return ok(reply, null, 'Course published');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COURSE_PUBLISH_FAILED', err.message || 'Failed to publish course');
    }
  });

  fastify.post('/courses/:id/unpublish', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await unpublishCourseCommand.execute((request.params as any).id, request.user!.sub);
      return ok(reply, null, 'Course unpublished');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COURSE_UNPUBLISH_FAILED', err.message || 'Failed to unpublish course');
    }
  });

  fastify.post('/lessons/:lessonId/quiz', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await createQuizCommand.execute((request.params as any).lessonId, request.user!.sub, (request.body as any) || {});
      return created(reply, result, 'Quiz created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'QUIZ_CREATE_FAILED', err.message || 'Failed to create quiz');
    }
  });

  fastify.post('/courses/:id/coupons', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const coupon = await createCouponCommand.execute((request.params as any).id, request.user!.sub, (request.body as any) || {});
      return created(reply, coupon, 'Coupon created');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COUPON_CREATE_FAILED', err.message || 'Failed to create coupon');
    }
  });

  fastify.get('/courses/:id/preview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const course = await getCoursePreviewQuery.execute((request.params as any).id, request.user!.sub);
      if (!course) return error(reply, 404, 'NOT_FOUND', 'Course not found');
      return ok(reply, course, 'Course preview loaded');
    } catch (err: any) {
      return error(reply, 500, 'COURSE_PREVIEW_FAILED', 'Failed to load preview');
    }
  });

  fastify.post('/courses/:id/apply-coupon', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = (request.body as Record<string, any>) || {};
      const result = await applyCouponCommand.execute((request.params as any).id, request.user!.sub, code);
      return ok(reply, result, 'Coupon applied');
    } catch (err: any) {
      return error(reply, err.statusCode || 500, err.code || 'COUPON_APPLY_FAILED', err.message || 'Failed to apply coupon');
    }
  });

  fastify.post('/courses/:id/enrollment-preview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await getEnrollmentPreviewQuery.execute((request.params as any).id, request.user!.sub);
      if (!result) return error(reply, 404, 'NOT_FOUND', 'Course not found');
      return ok(reply, result, 'Enrollment preview ready');
    } catch (err: any) {
      return error(reply, 500, 'ENROLLMENT_PREVIEW_FAILED', 'Failed to preview enrollment');
    }
  });
}
