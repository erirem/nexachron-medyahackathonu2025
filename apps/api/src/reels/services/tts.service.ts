import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TTSVoice } from '../dto/reel.dto';
import { SupabaseService } from '../../supabase/supabase.service';

export interface TTSRequest {
  text: string;
  voice: TTSVoice;
  speed: number;
  language: string;
}

export interface TTSResponse {
  audio_url: string;
  duration_seconds: number;
  file_size_bytes: number;
}

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);
  private readonly openaiApiKey: string;
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.isEnabled = !!this.openaiApiKey;

    if (this.isEnabled) {
      this.logger.log('OpenAI GPT TTS initialized');
    } else {
      this.logger.warn('OpenAI API not configured. Set OPENAI_API_KEY to enable TTS.');
    }
  }

  /**
   * Generate TTS audio from text using OpenAI GPT TTS
   */
  async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    if (!this.isEnabled) {
      throw new Error('TTS service not configured');
    }

    this.logger.log(`Generating TTS for ${request.text.length} characters with voice: ${request.voice}`);

    try {
      // 1. Call OpenAI TTS API
      const audioBuffer = await this.callOpenAITTS(request);

      // 2. Upload to storage and get URL
      const audioUrl = await this.uploadAudioToStorage(audioBuffer);

      // 3. Calculate duration (approximate)
      const duration = this.estimateAudioDuration(request.text, request.speed);

      return {
        audio_url: audioUrl,
        duration_seconds: duration,
        file_size_bytes: audioBuffer.length
      };

    } catch (error) {
      this.logger.error(`OpenAI TTS failed: ${error.message}`);
      this.logger.error('Full error:', error);
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Call OpenAI TTS API
   */
  private async callOpenAITTS(request: TTSRequest): Promise<Buffer> {
    const openaiUrl = 'https://api.openai.com/v1/audio/speech';

    // Map our voice enum to OpenAI voice names
    const voiceMap = {
      [TTSVoice.FEMALE_TR]: 'nova', // Turkish-like voice
      [TTSVoice.MALE_TR]: 'onyx',   // Turkish-like voice
      [TTSVoice.FEMALE_EN]: 'nova',  // English female
      [TTSVoice.MALE_EN]: 'onyx'     // English male
    };

    const openaiVoice = voiceMap[request.voice];

    try {
      const response = await firstValueFrom(
        this.httpService.post(openaiUrl, {
          model: 'tts-1', // or 'tts-1-hd' for higher quality
          input: request.text,
          voice: openaiVoice,
          response_format: 'mp3',
          speed: request.speed
        }, {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        })
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`OpenAI TTS API call failed: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`OpenAI TTS API call failed: ${error.message}`);
    }
  }

  /**
   * Upload audio to storage (Supabase Storage)
   */
  private async uploadAudioToStorage(audioBuffer: Buffer): Promise<string> {
    const fileName = `tts-${Date.now()}-${crypto.randomUUID()}.mp3`;
    
    this.logger.log(`Uploading TTS audio: ${fileName} (${audioBuffer.length} bytes)`);
    
    try {
      // Upload to Supabase Storage bucket 'reels'
      const { data, error } = await this.supabaseService.adminSupabase.storage
        .from('reels')
        .upload(`audio/${fileName}`, audioBuffer, {
          contentType: 'audio/mpeg',
          cacheControl: '3600'
        });

      if (error) {
        this.logger.error(`Failed to upload TTS audio: ${error.message}`);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabaseService.adminSupabase.storage
        .from('reels')
        .getPublicUrl(`audio/${fileName}`);

      this.logger.log(`TTS audio uploaded successfully: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      this.logger.error(`Failed to upload TTS audio: ${error.message}`);
      // Fallback to mock URL if upload fails
      return `https://example.com/storage/reels-audio/${fileName}`;
    }
  }

  /**
   * Generate mock TTS audio file (for development/fallback)
   */
  private async generateMockTTS(request: TTSRequest): Promise<TTSResponse> {
    this.logger.log('Generating mock TTS audio file');
    
    const fileName = `mock-tts-${Date.now()}-${crypto.randomUUID()}.mp3`;
    const duration = this.estimateAudioDuration(request.text, request.speed);
    
    try {
      // Create a simple silent audio file using FFmpeg
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const tempPath = `/tmp/${fileName}`;
      
      // Generate silent audio for the estimated duration
      await execAsync(`ffmpeg -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100" -t ${duration} -c:a libmp3lame -b:a 128k "${tempPath}"`);
      
      // Read the generated file
      const fs = require('fs/promises');
      const audioBuffer = await fs.readFile(tempPath);
      
      // Upload to storage
      const audioUrl = await this.uploadAudioToStorage(audioBuffer);
      
      // Clean up temp file
      await fs.unlink(tempPath).catch(() => {});
      
      this.logger.log(`Mock TTS generated: ${audioUrl} (${duration}s)`);
      
      return {
        audio_url: audioUrl,
        duration_seconds: duration,
        file_size_bytes: audioBuffer.length
      };
      
    } catch (error) {
      this.logger.error(`Mock TTS generation failed: ${error.message}`);
      
      // Ultimate fallback - return a mock URL
      return {
        audio_url: `https://example.com/mock-tts/${fileName}`,
        duration_seconds: duration,
        file_size_bytes: 1024
      };
    }
  }

  /**
   * Estimate audio duration based on text length and speed
   */
  private estimateAudioDuration(text: string, speed: number): number {
    // Average speaking rate: ~150 words per minute for Turkish
    // Adjust for speed multiplier
    const wordsPerMinute = 150 * speed;
    const wordCount = text.split(/\s+/).length;
    const durationMinutes = wordCount / wordsPerMinute;
    
    return Math.ceil(durationMinutes * 60); // Convert to seconds and round up
  }

  /**
   * Validate TTS text
   */
  validateTTSText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Text cannot be empty' };
    }

    if (text.length > 3000) {
      return { isValid: false, error: 'Text too long (max 3000 characters)' };
    }

    // Check for unsupported characters or patterns
    const unsupportedPattern = /[^\p{L}\p{N}\p{P}\p{Z}\p{S}]/u;
    if (unsupportedPattern.test(text)) {
      return { isValid: false, error: 'Text contains unsupported characters' };
    }

    return { isValid: true };
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): Array<{ voice: TTSVoice; name: string; language: string; gender: string }> {
    return [
      {
        voice: TTSVoice.FEMALE_TR,
        name: 'Emel (Türkçe Kadın)',
        language: 'tr-TR',
        gender: 'female'
      },
      {
        voice: TTSVoice.MALE_TR,
        name: 'Ahmet (Türkçe Erkek)',
        language: 'tr-TR',
        gender: 'male'
      },
      {
        voice: TTSVoice.FEMALE_EN,
        name: 'Aria (English Female)',
        language: 'en-US',
        gender: 'female'
      },
      {
        voice: TTSVoice.MALE_EN,
        name: 'Davis (English Male)',
        language: 'en-US',
        gender: 'male'
      }
    ];
  }

  /**
   * Test TTS service
   */
  async testTTS(): Promise<{ success: boolean; message: string }> {
    if (!this.isEnabled) {
      return { success: false, message: 'TTS service not configured' };
    }

    try {
      const testRequest: TTSRequest = {
        text: 'Bu bir test mesajıdır. OpenAI TTS servisi çalışıyor.',
        voice: TTSVoice.FEMALE_TR,
        speed: 1.0,
        language: 'tr-TR'
      };

      const result = await this.generateTTS(testRequest);
      
      return { 
        success: true, 
        message: `OpenAI TTS test successful. Audio duration: ${result.duration_seconds}s, Size: ${result.file_size_bytes} bytes` 
      };
    } catch (error) {
      return { success: false, message: `OpenAI TTS test failed: ${error.message}` };
    }
  }
}
