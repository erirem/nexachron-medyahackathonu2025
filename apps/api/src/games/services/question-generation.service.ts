import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsIngestService } from '../../news-ingest/news-ingest.service';
import { AACategory } from '../../news-ingest/dto/news-item.dto';
import { AiCategoryClassificationService } from '../../news/services/ai-category-classification.service';
import {
  Question,
  QuestionType,
  DifficultyLevel,
  QuestionPoolFilter,
  GameType,
  QuestionSource,
} from '../dto/game.dto';

interface GPTQuestionRequest {
  newsItems: Array<{
    title: string;
    content: string;
    category: string;
    publishedAt: string;
  }>;
  questionCount: number;
  difficulty: DifficultyLevel;
}

interface GPTQuestionResponse {
  questions: Array<{
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: DifficultyLevel;
    sourceNewsTitle: string;
  }>;
}

@Injectable()
export class QuestionGenerationService {
  private readonly logger = new Logger(QuestionGenerationService.name);
  private readonly openaiApiKey: string;
  private readonly openaiApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly newsIngestService: NewsIngestService,
    private readonly aiCategoryService: AiCategoryClassificationService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.openaiApiUrl = this.configService.get<string>('OPENAI_API_URL', 'https://api.openai.com/v1');
  }

  /**
   * Günlük haber trivia soruları oluştur (her gün saat 06:00'da)
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async generateDailyNewsTriviaQuestions() {
    this.logger.log('Starting daily news trivia question generation...');

    try {
      // Önce eski haberleri arşivle ve haber trivia sorularını temizle
      await this.cleanupOldNews();

      // Son 24 saatteki güncel haberleri çek
      this.logger.log('Fetching recent news...');
      const newsItems = await this.getRecentNews(AACategory.GUNCEL, 24);
      this.logger.log(`Found ${newsItems.length} recent news items`);

      if (newsItems.length === 0) {
        this.logger.warn('No recent news found for question generation');
        return;
      }

      // Her haber için ayrı ayrı soru üret
      this.logger.log(`Processing ${newsItems.length} news items for question generation`);
      
      let totalQuestionsGenerated = 0;
      
      for (const newsItem of newsItems) {
        this.logger.log(`Processing news: ${newsItem.title.substring(0, 50)}...`);
        
        try {
          // Her haber için 2-3 soru üret (farklı zorluk seviyelerinde)
          const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM];
          const questionsPerDifficulty = 1; // Her zorluk seviyesi için 1 soru
          
          for (const difficulty of difficulties) {
            const questions = await this.generateNewsTriviaQuestions([newsItem], questionsPerDifficulty, difficulty);
            
            if (questions.length > 0) {
              await this.saveQuestions(questions);
              totalQuestionsGenerated += questions.length;
              this.logger.log(`Generated ${questions.length} ${difficulty} questions for: ${newsItem.title.substring(0, 30)}...`);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to generate questions for news: ${newsItem.title}`, error);
          // Bir haber başarısız olsa bile diğerlerine devam et
          continue;
        }
      }
      
      this.logger.log(`Total questions generated: ${totalQuestionsGenerated}`);

      this.logger.log('Daily news trivia question generation completed');
    } catch (error) {
      this.logger.error(`Failed to generate daily news trivia questions: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
    }
  }

  /**
   * Filtrelere göre soruları getir
   */
  async getQuestions(filter: QuestionPoolFilter): Promise<Question[]> {
    this.logger.log(`Fetching questions with filter: ${JSON.stringify(filter)}`);

    try {
      let query = this.supabaseService.supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_active', true)
        .eq('game_type', filter.gameType); // Oyun türüne göre filtrele

      if (filter.category) {
        query = query.eq('category', filter.category);
      }

      if (filter.difficulty) {
        query = query.eq('difficulty', filter.difficulty);
      }

      if (filter.source) {
        query = query.eq('source', filter.source);
      }

      if (filter.dateRange) {
        query = query
          .gte('created_at', filter.dateRange.start.toISOString())
          .lte('created_at', filter.dateRange.end.toISOString());
      }

      // Önce tüm soruları getir, sonra rastgele seç
      const { data: allQuestions, error: allError } = await query;
      
      if (allError) {
        throw new Error(`Failed to fetch questions: ${allError.message}`);
      }
      
      if (allQuestions.length === 0) {
        return [];
      }
      
      // Rastgele karıştır ve limit kadar al
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, filter.limit);
      
      return selectedQuestions.map(this.mapDatabaseQuestionToQuestion);
    } catch (error) {
      this.logger.error(`Failed to get questions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Haberlerden haber trivia soruları üret
   */
  async generateNewsTriviaQuestions(
    newsItems: any[],
    questionCount: number,
    difficulty: DifficultyLevel,
  ): Promise<Question[]> {
    this.logger.log(`Generating ${questionCount} ${difficulty} news trivia questions from ${newsItems.length} news items`);

    try {
      const gptRequest: GPTQuestionRequest = {
        newsItems: newsItems.map(item => ({
          title: item.title,
          content: item.content,
          category: item.category,
          publishedAt: item.published_at,
        })),
        questionCount,
        difficulty,
      };

      this.logger.log(`Calling GPT API with ${gptRequest.newsItems.length} news items`);
      const response = await this.callGPTForNewsTriviaQuestions(gptRequest);
      this.logger.log(`GPT API returned ${response.questions.length} questions`);
      
      return response.questions.map((q, index) => ({
        id: crypto.randomUUID(),
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        category: this.mapCategoryToAACategory(q.sourceNewsTitle, newsItems),
        source: QuestionSource.NEWS_AI,
        sourceNewsId: this.findSourceNewsId(q.sourceNewsTitle, newsItems),
        gameType: GameType.NEWS_TRIVIA,
        createdAt: new Date(),
      }));
    } catch (error) {
      this.logger.error(`Failed to generate news trivia questions from news: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genel quiz soruları üret (manuel eklenen)
   */
  async generateGeneralQuizQuestions(
    questionCount: number,
    difficulty: DifficultyLevel,
    category: AACategory,
  ): Promise<Question[]> {
    this.logger.log(`Generating ${questionCount} ${difficulty} general quiz questions for category ${category}`);

    // Bu metod manuel quiz soruları için kullanılacak
    // Şimdilik boş döndürüyoruz, gelecekte genel bilgi soruları eklenebilir
    return [];
  }

  /**
   * Tüm quiz sorularını ve cevaplarını komple sıfırla
   */
  async resetAllQuestions() {
    try {
      this.logger.log('Starting complete quiz questions reset...');
      
      // Önce tüm cevapları sil
      this.logger.log('Deleting all game answers...');
      const { error: answersError } = await this.supabaseService.supabase
        .from('game_answers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm cevapları sil
      
      if (answersError) {
        this.logger.error(`Failed to delete game answers: ${answersError.message}`);
        throw new Error(`Failed to delete game answers: ${answersError.message}`);
      }
      
      // Sonra tüm soruları sil
      this.logger.log('Deleting all quiz questions...');
      const { error: questionsError } = await this.supabaseService.supabase
        .from('quiz_questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm soruları sil
      
      if (questionsError) {
        this.logger.error(`Failed to delete quiz questions: ${questionsError.message}`);
        throw new Error(`Failed to delete quiz questions: ${questionsError.message}`);
      }
      
      this.logger.log('All quiz questions and answers have been reset successfully');
      
      return {
        success: true,
        message: 'All quiz questions and answers have been reset',
        deletedAnswers: 'All game answers deleted',
        deletedQuestions: 'All quiz questions deleted'
      };
    } catch (error) {
      this.logger.error(`Failed to reset all questions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Soru havuzu istatistikleri
   */
  async getQuestionStats() {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('quiz_questions')
        .select('difficulty, category, is_active, created_at')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to fetch question stats: ${error.message}`);
      }

      const stats = {
        total: data.length,
        byDifficulty: {},
        byCategory: {},
        recent: data.filter(q => {
          const createdAt = new Date(q.created_at || new Date());
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return createdAt > oneDayAgo;
        }).length,
      };

      // Zorluk seviyesine göre grupla
      data.forEach(q => {
        stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
        stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get question stats: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private async getRecentNews(category: AACategory, hoursBack: number): Promise<any[]> {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    this.logger.log(`Fetching news from ${since.toISOString()} for category: ${category}`);

    const { data, error } = await this.supabaseService.supabase
      .from('news')
      .select('*')
      .eq('category', category.toLowerCase())
      .neq('category', 'archived') // Arşivlenmiş haberleri hariç tut
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      this.logger.error(`Database error: ${error.message}`);
      throw new Error(`Failed to fetch recent news: ${error.message}`);
    }

    this.logger.log(`Found ${data?.length || 0} news items`);
    return data || [];
  }

  /**
   * RSS feed'den güncel haberleri çek
   */
  private async fetchCurrentRssNews(): Promise<Array<{title: string; link: string; pubDate: string | null}>> {
    try {
      const rssUrl = 'https://www.aa.com.tr/tr/rss/default?cat=guncel';
      this.logger.log(`Fetching RSS feed from: ${rssUrl}`);
      
      const response = await this.httpService.axiosRef.get(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      // RSS XML'ini parse et
      const rssData = response.data;
      const items = this.parseRssXml(rssData);
      
      this.logger.log(`Parsed ${items.length} items from RSS feed`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to fetch RSS news: ${error.message}`);
      return [];
    }
  }

  /**
   * RSS XML'ini parse et
   */
  private parseRssXml(xmlData: string): Array<{title: string; link: string; pubDate: string | null}> {
    try {
      const items: Array<{title: string; link: string; pubDate: string | null}> = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      
      while ((match = itemRegex.exec(xmlData)) !== null) {
        const itemXml = match[1];
        
        const title = this.extractXmlValue(itemXml, 'title');
        const link = this.extractXmlValue(itemXml, 'link');
        const pubDate = this.extractXmlValue(itemXml, 'pubDate');
        
        if (title && link) {
          items.push({
            title: title.trim(),
            link: link.trim(),
            pubDate: pubDate ? pubDate.trim() : null
          });
        }
      }
      
      return items;
    } catch (error) {
      this.logger.error(`Failed to parse RSS XML: ${error.message}`);
      return [];
    }
  }

  /**
   * XML'den değer çıkar
   */
  private extractXmlValue(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : null;
  }

  /**
   * RSS'te olmayan haberleri arşivle ve haber trivia sorularını yenile
   */
  private async cleanupOldNews() {
    try {
      this.logger.log('Checking RSS feed for current news...');
      
      // RSS'ten güncel haberleri çek
      const currentRssNews = await this.fetchCurrentRssNews();
      this.logger.log(`Found ${currentRssNews.length} current news in RSS feed`);
      
      if (currentRssNews.length === 0) {
        this.logger.warn('No current news found in RSS feed');
        return;
      }
      
      // RSS'teki haber URL'lerini çıkar
      const currentRssUrls = currentRssNews.map(news => news.link);
      
      // DB'deki güncel haberleri getir
      const { data: dbNews, error: fetchError } = await this.supabaseService.supabase
        .from('news')
        .select('id, title, original_url, category')
        .eq('category', 'guncel');
      
      if (fetchError) {
        this.logger.error(`Failed to fetch DB news: ${fetchError.message}`);
        return;
      }
      
      // RSS'te olmayan haberleri bul
      const newsToReclassify = dbNews.filter(dbNewsItem => 
        !currentRssUrls.includes(dbNewsItem.original_url)
      );
      
      // ÖNCE eski quiz sorularını sil (bugün oluşturulanları koru)
      this.logger.log('Cleaning up old quiz questions...');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      // Önce eski sorulara ait cevapları sil
      const { data: oldQuestions } = await this.supabaseService.supabase
        .from('quiz_questions')
        .select('id')
        .lt('created_at', today.toISOString());
      
      if (oldQuestions && oldQuestions.length > 0) {
        const questionIds = oldQuestions.map(q => q.id);
        
        // Eski sorulara ait cevapları sil
        const { error: answersError } = await this.supabaseService.supabase
          .from('game_answers')
          .delete()
          .in('question_id', questionIds);
        
        if (answersError) {
          this.logger.error(`Failed to cleanup old answers: ${answersError.message}`);
        } else {
          this.logger.log(`Cleaned up answers for ${questionIds.length} old questions`);
        }
        
        // Şimdi eski soruları sil
        const { error: questionsError } = await this.supabaseService.supabase
          .from('quiz_questions')
          .delete()
          .lt('created_at', today.toISOString());
        
        if (questionsError) {
          this.logger.error(`Failed to cleanup quiz questions: ${questionsError.message}`);
        } else {
          this.logger.log(`Successfully cleaned up ${oldQuestions.length} old quiz questions`);
        }
      } else {
        this.logger.log('No old questions found to cleanup');
      }
      
      this.logger.log(`Found ${newsToReclassify.length} news items to reclassify`);
      
      if (newsToReclassify.length > 0) {
        // AI ile kategori belirleme işlemi
        for (const newsItem of newsToReclassify) {
          try {
            const classification = await this.aiCategoryService.classifyCategory({
              title: newsItem.title,
              content: '', // Content genellikle bu aşamada mevcut değil
            });

            if (classification && classification.category !== AACategory.GUNCEL) {
              const { error: updateError } = await this.supabaseService.supabase
                .from('news')
                .update({ category: classification.category })
                .eq('id', newsItem.id);

              if (updateError) {
                this.logger.error(`Failed to update category for news ${newsItem.id}: ${updateError.message}`);
              } else {
                this.logger.log(`Reclassified news ${newsItem.id} to category: ${classification.category} (confidence: ${classification.confidence})`);
              }
            }
          } catch (error) {
            this.logger.error(`Failed to classify news ${newsItem.id}: ${error.message}`);
          }
        }
        
        this.logger.log(`Reclassified ${newsToReclassify.length} news items with AI`);
      }
      
      this.logger.log('News archiving and trivia questions refresh completed successfully');
    } catch (error) {
      this.logger.error(`Failed to cleanup old news: ${error.message}`);
    }
  }

  private async callGPTForNewsTriviaQuestions(request: GPTQuestionRequest): Promise<GPTQuestionResponse> {
    const prompt = this.buildQuestionPrompt(request);
    this.logger.log(`GPT API Key available: ${!!this.openaiApiKey}`);
    this.logger.log(`GPT API URL: ${this.openaiApiUrl}`);

    try {
      this.logger.log(`Making GPT API call...`);
      const response = await this.httpService.axiosRef.post(
        `${this.openaiApiUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Sen bir eğitim uzmanısın ve haberlerden quiz soruları üretiyorsun. Sorular Türkçe olmalı ve haberlerin içeriğine dayalı olmalı.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`GPT API call failed: ${error.message}`);
      throw new Error('Failed to generate questions with AI');
    }
  }

  private buildQuestionPrompt(request: GPTQuestionRequest): string {
    const newsItem = request.newsItems[0]; // Tek haber
    const newsText = `Başlık: ${newsItem.title}\nİçerik: ${newsItem.content.substring(0, 300)}`;

    return `
Aşağıdaki güncel haberden ${request.questionCount} adet ${request.difficulty} zorluk seviyesinde HABER TRİVİA sorusu üret.

Haber:
${newsText}

Lütfen aşağıdaki formatta JSON yanıt ver:
{
  "questions": [
    {
      "question": "Soru metni",
      "type": "multiple_choice" | "true_false" | "fill_blank",
      "options": ["Seçenek1", "Seçenek2", "Seçenek3", "Seçenek4"], // sadece multiple_choice için
      "correctAnswer": "Doğru cevap",
      "explanation": "Açıklama",
      "difficulty": "${request.difficulty}",
      "sourceNewsTitle": "${newsItem.title}"
    }
  ]
}

Kurallar:
- Sorular MUTLAKA haberlerin içeriğine dayalı olmalı
- Haber trivia soruları olmalı (genel bilgi değil)
- ${request.difficulty} zorluk seviyesine uygun olmalı
- Çoktan seçmeli sorularda 4 seçenek olmalı
- Doğru cevaplar net ve kesin olmalı
- Açıklamalar eğitici olmalı
- Sorular Türkçe olmalı
- Haber trivia odaklı olmalı (güncel olaylar, haber detayları)
    `.trim();
  }

  private async saveQuestions(questions: Question[]) {
    const questionsToSave = questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      category: q.category,
      source: q.source,
      game_type: q.gameType,
      source_news_id: q.sourceNewsId,
      is_active: true,
      created_at: q.createdAt.toISOString(),
    }));

    const { error } = await this.supabaseService.supabase
      .from('quiz_questions')
      .insert(questionsToSave);

    if (error) {
      throw new Error(`Failed to save questions: ${error.message}`);
    }
  }

  private mapDatabaseQuestionToQuestion(dbQuestion: any): Question {
    return {
      id: dbQuestion.id,
      question: dbQuestion.question,
      type: dbQuestion.type,
      options: dbQuestion.options,
      correctAnswer: dbQuestion.correct_answer,
      explanation: dbQuestion.explanation,
      difficulty: dbQuestion.difficulty,
      category: dbQuestion.category,
      source: dbQuestion.source,
      gameType: dbQuestion.game_type,
      sourceNewsId: dbQuestion.source_news_id,
      createdAt: new Date(dbQuestion.created_at),
    };
  }

  private mapCategoryToAACategory(sourceTitle: string, newsItems: any[]): AACategory {
    const sourceItem = newsItems.find(item => item.title === sourceTitle);
    return sourceItem?.category || AACategory.GUNCEL;
  }

  private findSourceNewsId(sourceTitle: string, newsItems: any[]): string | undefined {
    const sourceItem = newsItems.find(item => item.title === sourceTitle);
    return sourceItem?.id;
  }

  /**
   * Manuel olarak haber trivia soruları oluştur
   */
  async generateManualNewsTriviaQuestions() {
    this.logger.log('Starting manual news trivia question generation...');

    try {
      // Güncel haberleri çek
      this.logger.log('Fetching current news...');
      const newsItems = await this.getRecentNews(AACategory.GUNCEL, 24);
      this.logger.log(`Found ${newsItems.length} current news items`);

      if (newsItems.length === 0) {
        this.logger.warn('No current news found for question generation');
        return {
          success: false,
          message: 'No current news found',
          questionsGenerated: 0
        };
      }

      // İlk 10 haberi al (çok fazla olmasın)
      const selectedNews = newsItems.slice(0, 10);
      this.logger.log(`Processing ${selectedNews.length} news items for question generation`);
      
      let totalQuestionsGenerated = 0;
      
      for (const newsItem of selectedNews) {
        this.logger.log(`Processing news: ${newsItem.title.substring(0, 50)}...`);
        
        try {
          // Her haber için 2 soru üret (kolay ve orta zorluk)
          const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM];
          const questionsPerDifficulty = 1;
          
          for (const difficulty of difficulties) {
            const questions = await this.generateNewsTriviaQuestions([newsItem], questionsPerDifficulty, difficulty);
            
            if (questions.length > 0) {
              await this.saveQuestions(questions);
              totalQuestionsGenerated += questions.length;
              this.logger.log(`Generated ${questions.length} ${difficulty} questions for: ${newsItem.title.substring(0, 30)}...`);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to generate questions for news: ${newsItem.title}`, error);
          continue;
        }
      }
      
      this.logger.log(`Total questions generated: ${totalQuestionsGenerated}`);

      return {
        success: true,
        message: `Successfully generated ${totalQuestionsGenerated} news trivia questions`,
        questionsGenerated: totalQuestionsGenerated
      };
    } catch (error) {
      this.logger.error(`Failed to generate manual news trivia questions: ${error.message}`);
      return {
        success: false,
        message: `Failed to generate questions: ${error.message}`,
        questionsGenerated: 0
      };
    }
  }
}
