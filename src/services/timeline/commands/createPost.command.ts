import { Post, User } from '../../../models';
import { containsFlaggedWords } from '../../../utils/profanity.util';

const MAX_IMAGE_SIZE_MB = 10;

export class CreatePostCommand {
  async execute(params: {
    userId: string;
    body: string;
    imageUrl?: string;
    tags?: string[];
  }): Promise<Post> {
    const { userId, body, imageUrl, tags } = params;
    if (!body || !body.trim()) {
      const err: any = new Error('Post body is required');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    if (body.length > 5000) {
      const err: any = new Error('Post body too long (max 5000 characters)');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByPk(userId, { attributes: ['id', 'status'] });
    if (!user || user.status !== 'active') {
      const err: any = new Error('Account not active');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }
    const flagged = containsFlaggedWords(body);
    const post = await Post.create({
      userId,
      body: body.trim(),
      imageUrl: imageUrl || null,
      tags: tags || [],
    });
    return post;
  }
}
export const createPostCommand = new CreatePostCommand();
