import { TutorBroadcast } from '../../../models';

export class PostUpdateCommand {
  async execute(tutorId: string, subject: string, body: string): Promise<TutorBroadcast> {
    if (!subject || !body) {
      const err: any = new Error('subject and body are required');
      err.code = 'VALIDATION_ERROR'; err.statusCode = 400; throw err;
    }
    return TutorBroadcast.create({ tutorId, subject, body });
  }
}
export const postUpdateCommand = new PostUpdateCommand();
