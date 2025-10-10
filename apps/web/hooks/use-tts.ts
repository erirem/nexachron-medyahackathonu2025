import { useState, useCallback } from 'react';
import { generateTTS, getTTSAudio } from '../services/api';

interface TTSGenerateRequest {
  newsId: string;
  contentType: 'summary' | 'full';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
}

interface TTSAudioResponse {
  id: string;
  newsId: string;
  contentType: string;
  voice: string;
  speed: number;
  audioUrl: string;
  fileSizeBytes: number;
  durationSeconds: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseTTSReturn {
  generateAudio: (request: TTSGenerateRequest) => Promise<TTSAudioResponse>;
  getAudio: (id: string) => Promise<TTSAudioResponse>;
  isLoading: boolean;
  error: string | null;
}

export function useTTS(): UseTTSReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = useCallback(async (request: TTSGenerateRequest): Promise<TTSAudioResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateTTS(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TTS generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAudio = useCallback(async (id: string): Promise<TTSAudioResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getTTSAudio(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get TTS audio';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateAudio,
    getAudio,
    isLoading,
    error,
  };
}
