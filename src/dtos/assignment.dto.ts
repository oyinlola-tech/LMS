export interface AssignmentListQuery {
  page?: number;
  limit?: number;
}

export interface AssignmentListItem {
  id: string;
  title: string;
  status: string;
  dueDate?: string | null;
  moduleNumber?: number | null;
  moduleName?: string;
  course: { id: string; title: string; thumbnailUrl?: string } | null;
  submissionStatus: string;
}

export interface AssignmentListResponse {
  items: AssignmentListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AssignmentDetailData {
  id: string;
  title: string;
  description?: string;
  status: string;
  moduleNumber?: number | null;
  moduleName?: string;
  dueDate?: Date | null;
  daysLeft?: number | null;
  proTip?: string;
  coreObjective?: string;
  keyDeliverables: string[];
  requirement: any;
  instructor: { id: string; fullName: string; avatarUrl?: string } | null;
  submissionStatus: string;
  feedback?: string | null;
}

export interface SubmitAssignmentInput {
  fileUrl: string;
  fileType?: string;
  fileSizeMb?: number;
  submissionNotes?: string;
}

export interface SubmitAssignmentUploadInput {
  file: any;
  submissionNotes?: string;
}

export interface UpdateSubmissionInput {
  submissionNotes?: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
}

export interface GradeSubmissionInput {
  submissionId: string;
  status: string;
  feedback?: string;
  score?: number;
  rubric?: string;
}

export interface SubmissionData {
  id: string;
  status: string;
  submissionNotes?: string;
  fileUrl?: string;
  fileType?: string;
  fileSizeMb?: number;
  feedback?: string;
  score?: number;
  rubric?: string;
  gradedAt?: Date;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    email?: string;
  };
}
