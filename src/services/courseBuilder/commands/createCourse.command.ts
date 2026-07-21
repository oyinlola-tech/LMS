import { Course } from '../../../models';

export class CreateCourseCommand {
  async execute(tutorId: string, body: { title: string; categories?: string[]; descriptionHtml?: string; learningObjectives?: string[] }): Promise<Course> {
    if (!body.title) {
      const err: any = new Error('title is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    return Course.create({
      tutorId,
      title: body.title,
      categories: Array.isArray(body.categories) ? body.categories : null,
      descriptionHtml: body.descriptionHtml || null,
      learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : null,
      isPublished: false,
    });
  }
}
export const createCourseCommand = new CreateCourseCommand();
