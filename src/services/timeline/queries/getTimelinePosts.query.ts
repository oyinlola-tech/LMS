import { Op } from 'sequelize';
import { Post, PostLike, PostBookmark, Follow, User, UserInterest, Enrollment, Course } from '../../../models';

export class GetTimelinePostsQuery {
  async execute(userId: string, params: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 20)));
    const offset = (page - 1) * limit;

    const acceptedFollows = await Follow.findAll({
      where: { followerId: userId, status: 'accepted' },
      attributes: ['followingId'],
    });
    const followingIds = acceptedFollows.map(f => f.followingId);
    followingIds.push(userId);

    const userInterests = await UserInterest.findAll({
      where: { UserId: userId },
      attributes: ['name'],
    });
    const interests = userInterests.map((ui: any) => ui.name);

    const enrollments = await Enrollment.findAll({
      where: { UserId: userId },
      include: [{ model: Course, attributes: ['id', 'title', 'category'] }],
      attributes: ['CourseId'],
    });
    const courseCategories = [...new Set(enrollments.map((e: any) => e.Course?.category).filter(Boolean))];

    const totalFromFollowed = await Post.count({
      where: { userId: { [Op.in]: followingIds } },
    });

    const showRecommendations = totalFromFollowed <= 30;

    let posts: any[];
    if (page === 1 && showRecommendations) {
      const followingPosts = await Post.findAll({
        where: { userId: { [Op.in]: followingIds } },
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] }],
        order: [['createdAt', 'DESC']],
        limit: Math.min(limit, totalFromFollowed),
      });

      const remainingCount = limit - followingPosts.length;
      let recommendedPosts: any[] = [];
      if (remainingCount > 0) {
        const excludeIds = [...followingIds];
        const interestWhere: any[] = [];
        if (interests.length) {
          interestWhere.push({ tags: { [Op.overlap]: interests } });
        }
        if (courseCategories.length) {
          courseCategories.forEach(cat => {
            interestWhere.push({ tags: { [Op.contains]: [cat] } });
          });
        }
        const recommendedWhere: any = {
          userId: { [Op.notIn]: excludeIds },
          ...(interestWhere.length ? { [Op.or]: interestWhere } : {}),
        };
        recommendedPosts = await Post.findAll({
          where: recommendedWhere,
          include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] }],
          order: [['likeCount', 'DESC'], ['createdAt', 'DESC']],
          limit: remainingCount,
        });
      }
      posts = [...followingPosts, ...recommendedPosts];
    } else {
      const whereClause: any = {};
      if (followingIds.length) {
        whereClause.userId = { [Op.in]: followingIds };
      }
      posts = await Post.findAll({
        where: whereClause,
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl', 'role', 'isVerified', 'checkmarkType'] }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
    }

    const postIds = posts.map(p => p.id);
    const userLikes = await PostLike.findAll({
      where: { postId: { [Op.in]: postIds }, userId },
      attributes: ['postId'],
    });
    const likedPostIds = new Set(userLikes.map(l => l.postId));
    const userBookmarks = await PostBookmark.findAll({
      where: { postId: { [Op.in]: postIds }, userId },
      attributes: ['postId'],
    });
    const bookmarkedPostIds = new Set(userBookmarks.map(b => b.postId));

    const mapped = posts.map(post => ({
      ...post.toJSON(),
      isLiked: likedPostIds.has(post.id),
      isBookmarked: bookmarkedPostIds.has(post.id),
    }));

    const total = await Post.count({
      where: { userId: { [Op.in]: followingIds } },
    });

    return {
      items: mapped,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
export const getTimelinePostsQuery = new GetTimelinePostsQuery();
