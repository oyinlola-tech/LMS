import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../enums';
import { createCourse, listCourses, getCourse, updateCourse, uploadCover, createModule, updateModule, deleteModule, reorderModules, createLesson, updateLesson, deleteLesson, reorderLessons, addLessonContent, uploadMedia, uploadResource, setLessonMediaUrl, createAssignment, updateAssignment, deleteAssignment, publishCourse, unpublishCourse, createQuiz, createCoupon, getCoursePreview, applyCoupon, getEnrollmentPreview } from '../controllers/courseBuilder.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createCourse);

  fastify.get('/courses', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, listCourses);

  fastify.get('/courses/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getCourse);

  fastify.put('/courses/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, updateCourse);

  fastify.post('/courses/:id/cover', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }] }, uploadCover);

  fastify.post('/courses/:id/modules', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createModule);

  fastify.put('/modules/:moduleId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, updateModule);

  fastify.delete('/modules/:moduleId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, deleteModule);

  fastify.put('/courses/:id/modules/reorder', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, reorderModules);

  fastify.post('/modules/:moduleId/lessons', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createLesson);

  fastify.put('/lessons/:lessonId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, updateLesson);

  fastify.delete('/lessons/:lessonId', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, deleteLesson);

  fastify.put('/modules/:moduleId/lessons/reorder', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, reorderLessons);

  fastify.post('/lessons/:lessonId/content', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, addLessonContent);

  fastify.post('/lessons/:lessonId/media', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }] }, uploadMedia);

  fastify.post('/lessons/:lessonId/resources', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR), async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (file) (request as any).uploadedFile = file;
  }] }, uploadResource);

  fastify.put('/lessons/:lessonId/media-url', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, setLessonMediaUrl);

  fastify.post('/courses/:id/assignments', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createAssignment);

  fastify.put('/assignments/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, updateAssignment);

  fastify.delete('/assignments/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, deleteAssignment);

  fastify.post('/courses/:id/publish', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, publishCourse);

  fastify.post('/courses/:id/unpublish', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, unpublishCourse);

  fastify.post('/lessons/:lessonId/quiz', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createQuiz);

  fastify.post('/courses/:id/coupons', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, createCoupon);

  fastify.get('/courses/:id/preview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getCoursePreview);

  fastify.post('/courses/:id/apply-coupon', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, applyCoupon);

  fastify.post('/courses/:id/enrollment-preview', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.TUTOR)] }, getEnrollmentPreview);
}
