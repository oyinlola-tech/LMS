export interface CourseListQuery {
  specialization?: string;
  difficulty?: string;
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CourseListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  categories: string[];
  difficulty: string;
  durationTotal: number;
  lessonsCount: number;
  isPublished: boolean;
  price: number;
  originalPrice: number | null;
  rating: number | null;
  reviewCount: number;
  enrollmentCount: number;
  isEnrolled?: boolean;
  progressPercent?: number;
  tutor: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    headline?: string;
  };
  createdAt?: Date;
}

export interface CoursePreviewData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  thumbnailUrl?: string;
  categories: string[];
  difficulty: string;
  durationTotal: number;
  lessonsCount: number;
  price: number;
  originalPrice: number | null;
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  tutor: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    headline?: string;
    bio?: string;
  };
}

export interface CourseCurriculumSection {
  id: string;
  title: string;
  position: number;
  lessons: {
    id: string;
    title: string;
    type: string;
    durationMinutes: number;
    isPreview: boolean;
  }[];
}

export interface CourseCurriculumData {
  courseId: string;
  title: string;
  sections: CourseCurriculumSection[];
}

export interface CourseReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface CourseReviewsData {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  reviews: CourseReviewItem[];
}

export interface CoursePricingData {
  courseId: string;
  title: string;
  price: number;
  originalPrice: number | null;
  hasCoupon?: boolean;
  coupon?: {
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    expiresAt: Date;
  };
  isEnrolled: boolean;
}

export interface CourseDetailData extends CoursePreviewData {
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  welcomeMessage?: string;
  congratulationsMessage?: string;
  sections: CourseCurriculumSection[];
  reviews: CourseReviewItem[];
  averageRating: number;
  totalReviews: number;
  totalEnrollments: number;
  isEnrolled: boolean;
  progressPercent?: number;
  lastAccessedAt?: Date;
}

export interface CategoryData {
  id: string;
  name: string;
  icon?: string;
  courseCount: number;
}

export interface DepartmentData {
  category: string;
  count: number;
  specializations: {
    id: string;
    name: string;
    icon?: string;
    courseCount: number;
  }[];
}

export interface CourseAnnouncementData {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  tutor: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface CourseEventData {
  id: string;
  title: string;
  description?: string;
  type: string;
  startTime: Date;
  endTime: Date;
  meetingUrl?: string;
  createdAt: Date;
  tutor: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface CourseCommentData {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface CourseAnnouncementInput {
  title: string;
  content: string;
}

export interface CourseEventInput {
  title: string;
  description?: string;
  type: string;
  startTime: Date;
  endTime: Date;
  meetingUrl?: string;
}

export interface CourseCommentInput {
  content: string;
}

export interface EnrollResult {
  enrollmentId: string;
  message: string;
}
