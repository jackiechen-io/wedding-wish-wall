export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'deleted';

export type Submission = {
  id: string;
  nickname: string;
  message: string;
  image_key: string;
  image_url: string;
  content_type: 'image/webp' | 'image/jpeg';
  file_size: number;
  status: SubmissionStatus;
  reject_reason: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
};

export type PublicSubmission = Pick<Submission, 'id' | 'nickname' | 'message' | 'image_url' | 'created_at' | 'approved_at'>;
