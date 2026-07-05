export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'deleted';

export type Submission = {
  id: string;
  nickname: string;
  message: string;
  hashtag: string;
  image_key: string;
  image_url: string;
  content_type: 'image/webp' | 'image/jpeg';
  file_size: number;
  image_width: number | null;
  image_height: number | null;
  status: SubmissionStatus;
  reject_reason: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
};

export type PublicSubmission = Pick<Submission, 'id' | 'nickname' | 'message' | 'hashtag' | 'image_url' | 'image_width' | 'image_height' | 'created_at' | 'approved_at'>;
