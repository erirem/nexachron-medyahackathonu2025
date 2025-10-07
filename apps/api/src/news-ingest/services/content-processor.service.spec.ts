import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ContentProcessorService } from './content-processor.service';
import { AACategory } from '../dto/news-item.dto';

describe('ContentProcessorService', () => {
  let service: ContentProcessorService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentProcessorService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContentProcessorService>(ContentProcessorService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('content extraction improvements', () => {
    it('should filter out unwanted AA content patterns', () => {
      const mockContent = `Spor, Futbol, Dünyadan Spor
        

        

        Şampiyonlar Ligi'nde ikinci hafta tamamlandı

        UEFA Şampiyonlar Ligi'nde ikinci hafta maçları tamamlandı.
        
                Emre Aşıkçı  |
        02.10.2025 - Güncelleme : 02.10.2025

        📲 Artık haberler size gelsin
        AA'nın WhatsApp kanallarına katılın, önemli gelişmeler cebinize düşsün.
        🔹 Gündemdeki gelişmeler, özel haber, analiz, fotoğraf ve videolar için Anadolu Ajansı
        🔹 Anlık gelişmeler için AA Canlı

        Bu gerçek haber içeriği burada olacak. Bu önemli bir haber metni.
        Bu paragraf gerçek haber içeriğini içeriyor ve korunmalı.`;

      // Access the private method for testing
      const result = (service as any).filterAAUnwantedContent(mockContent);
      
      expect(result).not.toContain('Spor, Futbol, Dünyadan Spor');
      expect(result).not.toContain('Şampiyonlar Ligi\'nde ikinci hafta tamamlandı');
      expect(result).not.toContain('Emre Aşıkçı');
      expect(result).not.toContain('📲');
      expect(result).not.toContain('🔹');
      expect(result).not.toContain('WhatsApp');
      expect(result).not.toContain('Anadolu Ajansı');
      expect(result).toContain('Bu gerçek haber içeriği burada olacak');
      expect(result).toContain('Bu paragraf gerçek haber içeriğini içeriyor');
    });

    it('should clean content properly', () => {
      const mockContent = `Bu gerçek haber içeriği burada olacak. Bu önemli bir haber metni.
        
        📲 Artık haberler size gelsin
        AA'nın WhatsApp kanallarına katılın.
        
        Bu paragraf gerçek haber içeriğini içeriyor ve korunmalı.`;

      // Access the private method for testing
      const result = (service as any).cleanContent(mockContent);
      
      expect(result).not.toContain('📲');
      expect(result).not.toContain('WhatsApp');
      expect(result).toContain('Bu gerçek haber içeriği burada olacak');
      // The cleanContent method should preserve the content but remove unwanted patterns
      expect(result.length).toBeGreaterThan(50);
    });
  });
});
