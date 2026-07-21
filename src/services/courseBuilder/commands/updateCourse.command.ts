import { Course } from '../../../models';

export class UpdateCourseCommand {
  async execute(courseId: string, userId: string, body: Record<string, any>): Promise<Course> {
    const course = await Course.findByPk(courseId);
    if (!course) {
      const err: any = new Error('Course not found');
      err.code = 'NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    if (course.tutorId !== userId) {
      const err: any = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    const { title, categories, descriptionHtml, learningObjectives, price, previousPrice, difficulty, durationWeeks, startDate } = body;
    if (title) course.title = title;
    if (categories) course.categories = categories;
    if (descriptionHtml !== undefined) course.descriptionHtml = descriptionHtml;
    if (learningObjectives) course.learningObjectives = learningObjectives;
    if (price !== undefined) course.price = price;
    if (previousPrice !== undefined) course.previousPrice = previousPrice;
    if (difficulty) {
      const validDifficulties = ['beginner', 'intermediate', 'expert'];
      if (!validDifficulties.includes(difficulty)) {
        const err: any = new Error(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
        err.code = 'VALIDATION_ERROR';
        err.statusCode = 400;
        throw err;
      }
      course.difficulty = difficulty;
    }
    if (durationWeeks !== undefined) course.durationWeeks = durationWeeks;
    if (startDate !== undefined) course.startDate = startDate;

    await course.save();
    return course;
  }
}
export const updateCourseCommand = new UpdateCourseCommand();
