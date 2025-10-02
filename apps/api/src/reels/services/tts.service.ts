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
  private readonly azureKey: string;
  private readonly azureRegion: string;
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService
  ) {
    this.azureKey = this.configService.get<string>('AZURE_SPEECH_KEY') || '';
    this.azureRegion = this.configService.get<string>('AZURE_SPEECH_REGION') || 'westeurope';
    this.isEnabled = !!this.azureKey;

    if (this.isEnabled) {
      this.logger.log('Azure Speech Services initialized for TTS');
    } else {
      this.logger.warn('Azure Speech Services not configured. Set AZURE_SPEECH_KEY to enable TTS.');
    }
  }

  /**
   * Generate TTS audio from text
   */
  async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    if (!this.isEnabled) {
      throw new Error('TTS service not configured');
    }

    this.logger.log(`Generating TTS for ${request.text.length} characters with voice: ${request.voice}`);

    try {
      // 1. Get access token
      const accessToken = await this.getAccessToken();

      // 2. Prepare SSML
      const ssml = this.buildSSML(request);

      // 3. Call Azure Speech API
      const audioBuffer = await this.callAzureSpeechAPI(ssml, accessToken);

      // 4. Upload to storage and get URL
      const audioUrl = await this.uploadAudioToStorage(audioBuffer);

      // 5. Calculate duration (approximate)
      const duration = this.estimateAudioDuration(request.text, request.speed);

      return {
        audio_url: audioUrl,
        duration_seconds: duration,
        file_size_bytes: audioBuffer.length
      };

    } catch (error) {
      this.logger.error(`Azure TTS failed: ${error.message}`);
      this.logger.error('Full error:', error);
      // For debugging, let's not fall back to mock - throw the error
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  /**
   * Get Azure access token
   */
  private async getAccessToken(): Promise<string> {
    const tokenUrl = `https://${this.azureRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, null, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.azureKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Azure access token: ${error.message}`);
    }
  }

  /**
   * Build SSML for Azure Speech
   */
  private buildSSML(request: TTSRequest): string {
    const voiceMap = {
      [TTSVoice.FEMALE_TR]: 'tr-TR-EmelNeural',
      [TTSVoice.MALE_TR]: 'tr-TR-AhmetNeural',
      [TTSVoice.FEMALE_EN]: 'en-US-AriaNeural',
      [TTSVoice.MALE_EN]: 'en-US-DavisNeural'
    };

    const voiceName = voiceMap[request.voice];
    
    // Simplified SSML without prosody for debugging
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${request.language}"><voice name="${voiceName}">${this.escapeSSMLText(request.text)}</voice></speak>`;
    
    this.logger.log(`Generated SSML: ${ssml}`);
    return ssml;
  }

  /**
   * Escape text for SSML
   */
  private escapeSSMLText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Call Azure Speech API
   */
  private async callAzureSpeechAPI(ssml: string, accessToken: string): Promise<Buffer> {
    const speechUrl = `https://${this.azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(speechUrl, ssml, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'User-Agent': 'Nexachron-Reels-TTS'
          },
          responseType: 'arraybuffer'
        })
      );

      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Azure Speech API call failed: ${error.message}`);
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
        text: 'Bu bir test mesajıdır. TTS servisi çalışıyor.',
        voice: TTSVoice.FEMALE_TR,
        speed: 1.0,
        language: 'tr-TR'
      };

      const result = await this.generateTTS(testRequest);
      
      return { 
        success: true, 
        message: `TTS test successful. Audio duration: ${result.duration_seconds}s, Size: ${result.file_size_bytes} bytes` 
      };
    } catch (error) {
      return { success: false, message: `TTS test failed: ${error.message}` };
    }
  }
}
