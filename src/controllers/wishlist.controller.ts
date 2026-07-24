import { FastifyRequest, FastifyReply } from 'fastify';
import { WishlistItem, Course } from '../models';
import { ok, created, error } from '../utils/response.util';

export async function listWishlist(request: FastifyRequest, reply: FastifyReply) {
  try {
    const items = await WishlistItem.findAll({
      where: { UserId: request.user!.sub },
      include: [{ model: Course, attributes: ['id', 'title', 'price', 'currency', 'thumbnailUrl', 'difficulty', 'category', 'totalHours', 'instructorName'] }],
      order: [['createdAt', 'DESC']],
    });
    return ok(reply, items, 'Wishlist loaded');
  } catch (err) {
    request.log.error(err, 'WISHLIST_LIST_FAILED');
    return error(reply, 500, 'WISHLIST_LIST_FAILED', 'Failed to load wishlist');
  }
}

export async function addToWishlist(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { courseId } = request.body as { courseId: string };
    const course = await Course.findByPk(courseId);
    if (!course) return error(reply, 404, 'COURSE_NOT_FOUND', 'Course not found');
    const [item] = await WishlistItem.findOrCreate({
      where: { UserId: request.user!.sub, CourseId: courseId },
    });
    return created(reply, item, 'Added to wishlist');
  } catch (err) {
    request.log.error(err, 'WISHLIST_ADD_FAILED');
    return error(reply, 500, 'WISHLIST_ADD_FAILED', 'Failed to add to wishlist');
  }
}

export async function removeFromWishlist(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { courseId } = request.params as { courseId: string };
    await WishlistItem.destroy({ where: { UserId: request.user!.sub, CourseId: courseId } });
    return ok(reply, null, 'Removed from wishlist');
  } catch (err) {
    request.log.error(err, 'WISHLIST_REMOVE_FAILED');
    return error(reply, 500, 'WISHLIST_REMOVE_FAILED', 'Failed to remove from wishlist');
  }
}

export async function checkWishlist(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { courseId } = request.params as { courseId: string };
    const item = await WishlistItem.findOne({ where: { UserId: request.user!.sub, CourseId: courseId } });
    return ok(reply, { inWishlist: !!item }, 'Checked');
  } catch (err) {
    request.log.error(err, 'WISHLIST_CHECK_FAILED');
    return error(reply, 500, 'WISHLIST_CHECK_FAILED', 'Failed to check wishlist');
  }
}