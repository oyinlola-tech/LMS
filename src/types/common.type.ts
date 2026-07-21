export interface IdParams {
  id: string;
}

export interface IdSubmissionIdParams {
  id: string;
  submissionId: string;
}

export interface IdNoteIdParams {
  id: string;
  noteId: string;
}

export interface IdBookmarkIdParams {
  id: string;
  bookmarkId: string;
}

export interface CourseIdParams {
  courseId: string;
}

export interface ModuleIdParams {
  moduleId: string;
}

export interface CourseIdLessonIdParams {
  id: string;
  lessonId: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface MulterFile {
  size: number;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
}
