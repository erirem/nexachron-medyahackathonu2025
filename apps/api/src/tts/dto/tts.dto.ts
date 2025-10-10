export enum TTSVoice {
  ALLOY = 'alloy',
  ECHO = 'echo',
  FABLE = 'fable',
  ONYX = 'onyx',
  NOVA = 'nova',
  SHIMMER = 'shimmer',
}

export enum TTSContentType {
  FULL = 'full',
  SUMMARY = 'summary',
  TITLE = 'title',
}

export enum TTSStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface GenerateTTSRequest {
  newsId: string;
  contentType: TTSContentType;
  voice?: TTSVoice;
  speed?: number;
}

export interface TTSAudioResponse {
  id: string;
  newsId: string;
  contentType: TTSContentType;
  voice: TTSVoice;
  speed: number;
  audioUrl?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  status: TTSStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TTSListResponse {
  items: TTSAudioResponse[];
  total: number;
  page: number;
  limit: number;
}
