import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import {
  RawNewsItem,
  ProcessedNewsItem,
  AACategory,
  DEFAULT_MODE,
  SummaryType,
} from '../dto/news-item.dto';

@Injectable()
export class ContentProcessorService {
  private readonly logger = new Logger(ContentProcessorService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Processes raw news data and extracts full content
   */
  async processNewsItem(
    rawItem: RawNewsItem,
    category: AACategory,
  ): Promise<ProcessedNewsItem | null> {
    try {
      // Extract full content and media with web scraping
      const fullContent = await this.extractFullContent(rawItem.link);

      // Skip if no content
      if (!fullContent.trim()) {
        this.logger.warn(`No content extracted from: ${rawItem.link}`);
        return null;
      }

      // Extract enhanced images and videos from the page
      const enhancedMedia = await this.extractMediaFromPage(rawItem.link);

      // Extract city information
      const city = this.extractCityFromContent(fullContent, rawItem.title);

      // Parse published date
      const publishedAt = this.parsePublishedDate(rawItem.pubDate);

      return {
        title: rawItem.title,
        content: fullContent,
        description: rawItem.description, // Original RSS description
        summary: rawItem.description, // Will be replaced with AI summary if available
        summary_type: SummaryType.ORIGINAL, // Default to original, will be updated if AI generates summary
        image_url: enhancedMedia.featured_image || rawItem.enclosure?.url,
        video_url: enhancedMedia.featured_video, // Featured video URL
        media_gallery: enhancedMedia, // All extracted media for gallery
        source: 'Anadolu Ajansı',
        category: category, // Store AA category directly
        mode: DEFAULT_MODE, // Default mood, will be calculated from user feedback
        city: city,
        original_url: rawItem.link,
        published_at: publishedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to process news item: ${rawItem.link}`, error);
      return null;
    }
  }

  /**
   * Enhanced web scraping for full content and media extraction
   */
  private async extractFullContent(url: string): Promise<string> {
    const maxRetries = 3;
    const timeout = 10000; // Reduced from 20s to 10s

    let response;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await firstValueFrom(
          this.httpService.get(url, {
            timeout,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              Connection: 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            },
          }),
        );

        // If successful, break out of retry loop
        break;
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.warn(
            `Failed to extract content from ${url} after ${maxRetries} attempts:`,
            error.message,
          );
          return '';
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        this.logger.debug(
          `Retrying content extraction for ${url}, attempt ${attempt}/${maxRetries}, waiting ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const $ = cheerio.load(response.data);

    // Remove unwanted elements first - more comprehensive cleanup
    $(
      'script, style, nav, header, footer, .advertisement, .ads, .social-share, .related-news, .comments, .sidebar, .menu, .navigation, .breadcrumb, .tags, .author-info, .date-info, .share-buttons, .newsletter, .subscription, .cookie-notice, .popup, .modal, .overlay',
    ).remove();

    // Enhanced AA-specific selectors for better content extraction
    const contentSelectors = [
      '.detay-content', // Main AA detail content
      '.story-body .story-text', // Full story body
      'article .content-body', // Article content body
      '[data-role="article-content"]', // Data attribute content
      '.news-content .news-body', // News body sections
      '.article-body p', // Article paragraphs
      '.detay-icerik', // AA detail content
      '.haber-metni', // News text
      'div[class*="detay"] p', // Detail paragraphs
      '.content-area p', // Content area paragraphs
      'main article p', // Main article paragraphs
      '.article-content p', // Article content paragraphs
    ];

    let content = '';
    let bestContent = '';
    let maxLength = 0;

    // Try each selector and keep the longest content
    for (const selector of contentSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        const currentContent = elements
          .map((_, el) => {
            const $el = $(el);
            // Skip elements that are likely navigation or metadata
            if (
              $el.hasClass('breadcrumb') ||
              $el.hasClass('tags') ||
              $el.hasClass('author') ||
              $el.hasClass('date') ||
              $el.hasClass('share') ||
              $el.text().includes('📲') ||
              $el.text().includes('🔹') ||
              $el.text().includes('WhatsApp') ||
              $el.text().includes('Anadolu Ajansı') ||
              $el.text().includes('abonelik') ||
              $el.text().includes('iletişime geçiniz')
            ) {
              return '';
            }
            return $el.text().trim();
          })
          .get()
          .filter((text) => text.length > 20) // Filter out very short text
          .join('\n')
          .trim();

        if (currentContent.length > maxLength) {
          maxLength = currentContent.length;
          bestContent = currentContent;
        }
      }
    }

    content = bestContent;

    // Advanced fallback: Extract meaningful paragraphs
    if (!content || content.length < 200) {
      const paragraphs = $('p')
        .map((_, el) => {
          const $el = $(el);
          const text = $el.text().trim();

          // Skip paragraphs with unwanted content
          if (
            text.length < 50 ||
            text.includes('©') ||
            text.includes('Cookie') ||
            text.includes('Reklam') ||
            text.includes('E-posta') ||
            text.includes('📲') ||
            text.includes('🔹') ||
            text.includes('WhatsApp') ||
            text.includes('Anadolu Ajansı') ||
            text.includes('abonelik') ||
            text.includes('iletişime geçiniz') ||
            text.includes('Bu haberi paylaşın') ||
            text.includes('İlgili konular') ||
            text.includes('Güncelleme') ||
            text.includes('|') ||
            $el.hasClass('breadcrumb') ||
            $el.hasClass('tags') ||
            $el.hasClass('author') ||
            $el.hasClass('date') ||
            $el.hasClass('share')
          ) {
            return null;
          }

          return text;
        })
        .get()
        .filter((text) => text !== null);

      if (paragraphs.length > 0) {
        content = paragraphs.join('\n\n');
      }
    }

    // Additional fallback: Try main content areas
    if (!content || content.length < 200) {
      const mainSelectors = [
        'main',
        '[role="main"]',
        '.main-content',
        '#main-content',
      ];
      for (const selector of mainSelectors) {
        const mainContent = $(selector).text().trim();
        if (mainContent.length > content.length) {
          content = mainContent;
        }
      }
    }

    // Clean and validate content
    content = this.cleanContent(content);

    // Additional AA-specific content filtering
    content = this.filterAAUnwantedContent(content);

    this.logger.debug(`Extracted ${content.length} characters from ${url}`);
    return content;
  }

  /**
   * Extract all media (images, videos) from article page for gallery support
   */
  private async extractMediaFromPage(url: string): Promise<{
    images: Array<{
      url: string;
      alt?: string;
      caption?: string;
      width?: number;
      height?: number;
      quality_score: number;
      source: string;
    }>;
    videos: Array<{
      url: string;
      title?: string;
      duration?: number;
      quality_score: number;
      source: string;
    }>;
    featured_image?: string;
    featured_video?: string;
  }> {
    // Media extraction with retry logic
    const maxRetries = 3;
    const timeout = 8000; // Reduced from 15s to 8s

    let response;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await firstValueFrom(
          this.httpService.get(url, {
            timeout,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              Connection: 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            },
          }),
        );
        break;
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.debug(
            `Failed to extract media from ${url} after ${maxRetries} attempts:`,
            error.message,
          );
          return {
            images: [],
            videos: [],
            featured_image: undefined,
            featured_video: undefined,
          };
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 2000);
        this.logger.debug(
          `Retrying media extraction for ${url}, attempt ${attempt}/${maxRetries}, waiting ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const $ = cheerio.load(response.data);

    const images: Array<{
      url: string;
      alt?: string;
      caption?: string;
      width?: number;
      height?: number;
      quality_score: number;
      source: string;
    }> = [];

    const videos: Array<{
      url: string;
      title?: string;
      duration?: number;
      quality_score: number;
      source: string;
    }> = [];

    // Extract all images with comprehensive scoring
    const imageSelectors = [
      {
        selector: 'meta[property="og:image"]',
        source: 'og:image',
        baseScore: 100,
      },
      {
        selector: 'meta[name="twitter:image"]',
        source: 'twitter:image',
        baseScore: 95,
      },
      {
        selector: 'meta[name="twitter:image:src"]',
        source: 'twitter:image:src',
        baseScore: 95,
      },
      {
        selector: 'img.detay-buyukFoto',
        source: 'aa-main-photo',
        baseScore: 90,
      }, // AA main photo
      {
        selector: '.article-image img, .news-image img',
        source: 'article',
        baseScore: 80,
      },
      {
        selector: '.detay-foto img, .detay-resim img',
        source: 'aa-gallery',
        baseScore: 85,
      },
      { selector: 'figure img, .figure img', source: 'figure', baseScore: 75 },
      {
        selector: '.gallery img, .photo-gallery img',
        source: 'gallery',
        baseScore: 70,
      },
      {
        selector: '[data-role="article-image"] img',
        source: 'data-image',
        baseScore: 75,
      },
      {
        selector: '.content-image img, .story-image img',
        source: 'content',
        baseScore: 65,
      },
      {
        selector: 'img[alt*="haber"], img[alt*="news"]',
        source: 'news-tagged',
        baseScore: 60,
      },
      {
        selector: '.main-content img, article img',
        source: 'main-content',
        baseScore: 50,
      },
      {
        selector: 'img[src*="uploads"], img[src*="images"]',
        source: 'uploaded',
        baseScore: 45,
      },
      {
        selector: 'img[src^="/uploads/"]',
        source: 'aa-relative-uploads',
        baseScore: 80,
      }, // AA relative upload paths
      { selector: 'img', source: 'all-images', baseScore: 30 }, // Catch all images to debug
    ];

    // Process each image selector
    for (const { selector, source, baseScore } of imageSelectors) {
      $(selector).each((_, el) => {
        let imgSrc = '';
        let alt = '';
        let caption = '';

        if ($(el).is('meta')) {
          imgSrc = $(el).attr('content') || '';
          // Meta tag found - keeping for processing
        } else {
          imgSrc =
            $(el).attr('src') ||
            $(el).attr('data-src') ||
            $(el).attr('data-lazy') ||
            '';
          alt = $(el).attr('alt') || '';

          // Processing images silently

          // Try to find caption from parent elements
          const figcaption = $(el)
            .closest('figure')
            .find('figcaption')
            .text()
            .trim();
          const parentCaption = $(el)
            .parent()
            .find('.caption, .photo-caption')
            .text()
            .trim();
          caption = figcaption || parentCaption || '';
        }

        if (imgSrc) {
          // Handle AA-specific relative paths FIRST (before general relative handling)
          if (imgSrc.startsWith('/uploads/')) {
            // AA relative uploads should go to cdnuploads subdomain directly
            imgSrc = `https://cdnuploads.aa.com.tr${imgSrc}`;
          } else if (imgSrc.startsWith('/')) {
            // General relative URL handling for other paths
            const urlObj = new URL(url);
            imgSrc = `${urlObj.protocol}//${urlObj.host}${imgSrc}`;
          }

          // Now validate the absolute URL
          if (!this.isValidImageUrl(imgSrc)) {
            return; // Skip invalid images
          }

          // Skip duplicates
          if (images.some((img) => img.url === imgSrc)) {
            return;
          }

          // Enhanced quality scoring with stricter filtering
          let qualityScore = baseScore;

          // Resolution indicators
          if (imgSrc.includes('1920') || imgSrc.includes('1200'))
            qualityScore += 25;
          else if (imgSrc.includes('800') || imgSrc.includes('600'))
            qualityScore += 15;
          else if (imgSrc.includes('400') || imgSrc.includes('300'))
            qualityScore += 5;

          // File type preferences
          if (imgSrc.includes('.jpg') || imgSrc.includes('.jpeg'))
            qualityScore += 10;
          else if (imgSrc.includes('.webp')) qualityScore += 15;
          else if (imgSrc.includes('.png')) qualityScore += 8;

          // Content relevance scoring
          if (alt) {
            const altLower = alt.toLowerCase();
            // Bonus for news-related alt text
            if (
              altLower.includes('haber') ||
              altLower.includes('news') ||
              altLower.includes('foto')
            )
              qualityScore += 15;
            // Penalty for generic alt text
            if (
              altLower.includes('resim') ||
              altLower.includes('image') ||
              altLower.includes('photo')
            )
              qualityScore -= 5;
            // Bonus for meaningful descriptions
            if (alt.length > 20) qualityScore += 10;
          }

          if (caption) {
            const captionLower = caption.toLowerCase();
            // Bonus for meaningful captions
            if (caption.length > 30) qualityScore += 15;
            if (captionLower.includes('aa') || captionLower.includes('anadolu'))
              qualityScore += 10;
          }

          // URL quality indicators - be more selective
          const urlLower = imgSrc.toLowerCase();

          // Skip default AA logo and placeholder images completely
          if (
            urlLower.includes('bip.png') ||
            urlLower.includes('favicon') ||
            urlLower.includes('logo.png') ||
            urlLower.includes('placeholder') ||
            urlLower.includes('default-image')
          ) {
            return; // Skip placeholder/logo images
          }

          // Strong penalties for likely assets
          if (urlLower.includes('/assets/') || urlLower.includes('/static/'))
            qualityScore -= 30;
          if (urlLower.includes('/common/') || urlLower.includes('/shared/'))
            qualityScore -= 25;
          if (urlLower.includes('/ui/') || urlLower.includes('/theme/'))
            qualityScore -= 35;

          // Bonus for news-specific paths
          if (
            urlLower.includes('/upload') ||
            urlLower.includes('/media') ||
            urlLower.includes('/image')
          )
            qualityScore += 10;
          if (urlLower.includes('/news') || urlLower.includes('/haber'))
            qualityScore += 15;
          if (urlLower.includes('/gallery') || urlLower.includes('/galeri'))
            qualityScore += 12;

          // Skip images with very low quality scores
          if (qualityScore < 40) {
            return; // Skip this image
          }

          // Extract dimensions if available
          const width = parseInt($(el).attr('width') || '0') || undefined;
          const height = parseInt($(el).attr('height') || '0') || undefined;

          if (width && height) {
            if (width >= 800 && height >= 600) qualityScore += 15;
            else if (width >= 400 && height >= 300) qualityScore += 8;
          }

          images.push({
            url: imgSrc,
            alt: alt || undefined,
            caption: caption || undefined,
            width,
            height,
            quality_score: qualityScore,
            source,
          });
        }
      });
    }

    // Extract all videos with metadata
    const videoSelectors = [
      {
        selector: 'meta[property="og:video"]',
        source: 'og:video',
        baseScore: 100,
      },
      {
        selector: 'meta[property="og:video:url"]',
        source: 'og:video-url',
        baseScore: 95,
      },
      { selector: 'iframe[src*="youtube"]', source: 'youtube', baseScore: 90 },
      { selector: 'iframe[src*="vimeo"]', source: 'vimeo', baseScore: 85 },
      {
        selector: 'iframe[src*="dailymotion"]',
        source: 'dailymotion',
        baseScore: 80,
      },
      {
        selector: 'video source, video',
        source: 'native-video',
        baseScore: 75,
      },
      {
        selector: '.video-container iframe, .video-wrapper iframe',
        source: 'embedded',
        baseScore: 70,
      },
      {
        selector: 'iframe[src*="tiktok"], iframe[src*="instagram"]',
        source: 'social',
        baseScore: 65,
      },
    ];

    for (const { selector, source, baseScore } of videoSelectors) {
      $(selector).each((_, el) => {
        let videoUrl = '';
        let title = '';

        if ($(el).is('meta')) {
          videoUrl = $(el).attr('content') || '';
        } else if ($(el).is('iframe')) {
          videoUrl = $(el).attr('src') || '';
          title =
            $(el).attr('title') ||
            $(el)
              .closest('.video-container, .video-wrapper')
              .find('.video-title')
              .text()
              .trim();
        } else if ($(el).is('video') || $(el).is('source')) {
          videoUrl = $(el).attr('src') || '';
          title =
            $(el).attr('title') ||
            $(el).closest('figure').find('figcaption').text().trim();
        }

        if (videoUrl) {
          // Make relative URLs absolute
          if (videoUrl.startsWith('/')) {
            const urlObj = new URL(url);
            videoUrl = `${urlObj.protocol}//${urlObj.host}${videoUrl}`;
          }

          // Skip duplicates
          if (videos.some((vid) => vid.url === videoUrl)) {
            return;
          }

          let qualityScore = baseScore;

          // Bonus for popular platforms
          if (videoUrl.includes('youtube.com')) qualityScore += 20;
          else if (videoUrl.includes('vimeo.com')) qualityScore += 15;

          // Bonus for having title/description
          if (title && title.length > 10) qualityScore += 10;

          videos.push({
            url: videoUrl,
            title: title || undefined,
            quality_score: qualityScore,
            source,
          });
        }
      });
    }

    // Sort by quality score
    images.sort((a, b) => b.quality_score - a.quality_score);
    videos.sort((a, b) => b.quality_score - a.quality_score);

    // Limit the number of images to avoid storage bloat (keep top 5-8 high-quality images)
    const maxImages = 8;
    if (images.length > maxImages) {
      images.splice(maxImages);
    }

    // Limit videos too (keep top 3)
    const maxVideos = 3;
    if (videos.length > maxVideos) {
      videos.splice(maxVideos);
    }

    // Get featured media (highest quality)
    const featuredImage = images.length > 0 ? images[0].url : undefined;
    const featuredVideo = videos.length > 0 ? videos[0].url : undefined;

    this.logger.log(`🎯 Media extraction results for ${url}:`);
    this.logger.log(`   📸 Images found: ${images.length}`);
    this.logger.log(`   🎬 Videos found: ${videos.length}`);
    this.logger.log(`   ⭐ Featured image: ${featuredImage}`);
    this.logger.log(`   ⭐ Featured video: ${featuredVideo}`);

    if (images.length > 0) {
      this.logger.log(`   🔍 Image details:`);
      images.forEach((img, idx) => {
        this.logger.log(
          `     ${idx + 1}. ${img.url} (score: ${img.quality_score}, source: ${img.source})`,
        );
      });
    }

    return {
      images,
      videos,
      featured_image: featuredImage,
      featured_video: featuredVideo,
    };
  }

  /**
   * Validate if URL is a valid image and not a site asset
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const fullUrl = url.toLowerCase();

      // Debug logs removed for cleaner output

      // Special case for AA userFiles with encoded paths (case insensitive)
      const isAAUserFile =
        fullUrl.includes('cdnuploads.aa.com.tr') &&
        (fullUrl.includes('/uploads/userfiles/') ||
          fullUrl.includes('/uploads/userFiles/'));

      // Check if it's a valid image extension (including encoded paths for userFiles)
      const hasValidExtension =
        pathname.includes('.jpg') ||
        pathname.includes('.jpeg') ||
        pathname.includes('.png') ||
        pathname.includes('.webp') ||
        pathname.includes('.gif') ||
        (isAAUserFile &&
          (fullUrl.includes('.jpg') ||
            fullUrl.includes('.jpeg') ||
            fullUrl.includes('.png')));

      if (!hasValidExtension) {
        return false;
      }

      // Filter out common site assets and social media icons
      const assetKeywords = [
        'logo',
        'icon',
        'favicon',
        'avatar',
        'profile',
        'facebook',
        'twitter',
        'instagram',
        'youtube',
        'linkedin',
        'whatsapp',
        'telegram',
        'share',
        'social',
        'banner',
        'header',
        'footer',
        'menu',
        'nav',
        'reklam',
        'reklamlar',
        'advertisement',
        'ads',
        'cookie',
        'gdpr',
        'privacy',
        'thumbnail',
        'placeholder', // Removed 'thumb' - it filters out AA thumbs_b_c images
        'sprite',
        'background',
        'bg',
        'widgets',
        'sidebar',
        'comment',
        'arrow',
        'bullet',
        'dot',
        'pixel',
        'tracking',
        'analytics',
        'counter',
      ];

      // Check if URL contains any asset keywords - but exclude AA-specific patterns
      const isAAThumb =
        fullUrl.includes('cdnuploads.aa.com.tr') &&
        fullUrl.includes('thumbs_b_c');
      const containsAssetKeyword =
        !(isAAThumb || isAAUserFile) &&
        assetKeywords.some(
          (keyword) => fullUrl.includes(keyword) || pathname.includes(keyword),
        );

      if (containsAssetKeyword) {
        return false;
      }

      // Filter out very small images (likely icons)
      const sizePattern = /(\d+)x(\d+)/;
      const sizeMatch = fullUrl.match(sizePattern);
      if (sizeMatch) {
        const width = parseInt(sizeMatch[1]);
        const height = parseInt(sizeMatch[2]);
        if (width < 200 || height < 200) {
          return false;
        }
      }

      // Filter out common icon sizes in filename
      const iconSizes = [
        '16x16',
        '32x32',
        '48x48',
        '64x64',
        '96x96',
        '128x128',
        '150x150',
      ];
      if (iconSizes.some((size) => fullUrl.includes(size))) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * İçeriği temizler
   */
  private cleanContent(content: string): string {
    if (!content || content.length < 50) {
      return '';
    }

    return (
      content
        // Remove multiple whitespace and normalize
        .replace(/\s+/g, ' ')
        // Remove unwanted patterns
        .replace(/📲.*?(?=\n|$)/g, '')
        .replace(/🔹.*?(?=\n|$)/g, '')
        .replace(/WhatsApp.*?(?=\n|$)/g, '')
        .replace(/Anadolu Ajansı.*?(?=\n|$)/g, '')
        .replace(/abonelik.*?(?=\n|$)/g, '')
        .replace(/iletişime geçiniz.*?(?=\n|$)/g, '')
        .replace(/Bu haberi paylaşın.*?(?=\n|$)/g, '')
        .replace(/İlgili konular.*?(?=\n|$)/g, '')
        .replace(/Güncelleme.*?(?=\n|$)/g, '')
        .replace(/Emre Aşıkçı.*?(?=\n|$)/g, '')
        .replace(/\d{2}\.\d{2}\.\d{4}.*?(?=\n|$)/g, '')
        .replace(/\|.*?(?=\n|$)/g, '')
        // Remove empty lines and normalize
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        // Final validation
        .trim()
    );
  }

  /**
   * AA-specific content filtering to remove unwanted elements
   */
  private filterAAUnwantedContent(content: string): string {
    if (!content) return '';

    // Split content into lines for better filtering
    const lines = content.split('\n');
    const filteredLines = lines.filter((line) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) return false;

      // Skip lines with unwanted patterns - more comprehensive matching
      const unwantedPatterns = [
        /^Spor,?\s*Futbol,?\s*Dünyadan Spor\s*$/,
        /^Şampiyonlar Ligi'nde ikinci hafta tamamlandı\s*$/,
        /^UEFA Şampiyonlar Ligi'nde ikinci hafta maçları tamamlandı\.\s*$/,
        /Emre Aşıkçı/,
        /Güncelleme\s*:\s*\d{2}\.\d{2}\.\d{4}/,
        /📲.*$/,
        /🔹.*$/,
        /WhatsApp.*$/,
        /Anadolu Ajansı.*$/,
        /abonelik.*$/,
        /iletişime geçiniz.*$/,
        /Bu haberi paylaşın.*$/,
        /İlgili konular.*$/,
        /Fertek Mahalle Muhtarı.*$/,
        /restorasyon.*$/,
        /Tarihi Fertek Hamamı.*$/,
        /Anadolu Ajansı web sitesinde.*$/,
        /AA Haber Akış Sistemi.*$/,
        /Abonelik için lütfen.*$/,
        /^\s*\|\s*$/,
        /^\s*-\s*$/,
        /^\s*\.\s*$/,
        /^\s*\d{2}\.\d{2}\.\d{4}.*$/,
        /AA'nın WhatsApp kanallarına katılın.*$/,
        /önemli gelişmeler cebinize düşsün.*$/,
        /Gündemdeki gelişmeler.*$/,
        /özel haber, analiz, fotoğraf ve videolar için.*$/,
        /Anlık gelişmeler için AA Canlı.*$/,
      ];

      return !unwantedPatterns.some((pattern) => pattern.test(trimmedLine));
    });

    return filteredLines.join('\n').trim();
  }

  /**
   * İçerikten şehir bilgisini çıkarır
   */
  private extractCityFromContent(
    content: string,
    title: string,
  ): string | undefined {
    const text = `${title} ${content}`.toLowerCase();

    // Türkiye'nin büyük şehirleri
    const cities = [
      'istanbul',
      'ankara',
      'izmir',
      'bursa',
      'antalya',
      'adana',
      'konya',
      'şanlıurfa',
      'gaziantep',
      'kocaeli',
      'mersin',
      'diyarbakır',
      'hatay',
      'sakarya',
      'manisa',
      'kayseri',
      'balıkesir',
      'van',
      'aydın',
      'denizli',
      'muğla',
      'tekirdağ',
      'elazığ',
      'erzurum',
      'sivas',
      'çorum',
      'batman',
      'sanliurfa',
      'urfa',
    ];

    for (const city of cities) {
      if (text.includes(city)) {
        // İlk harfi büyük yap
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }

    return undefined;
  }

  /**
   * Published date'i parse eder
   */
  private parsePublishedDate(pubDate: string): Date {
    try {
      const date = new Date(pubDate);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch {
      return new Date();
    }
  }

  /**
   * Toplu işlem için - geliştirilmiş rate limiting ile
   */
  async processBatch(
    items: Map<AACategory, RawNewsItem[]>,
  ): Promise<ProcessedNewsItem[]> {
    const processedItems: ProcessedNewsItem[] = [];
    const maxConcurrentItems = 5; // Sınırla paralel işlem sayısını
    const maxConcurrentCategories = 2; // Sınırla paralel kategori sayısını

    // Önce kategorileri öncelik sırasına göre sırala
    const categoryPriority: Record<AACategory, number> = {
      [AACategory.GUNCEL]: 1,
      [AACategory.POLITIKA]: 2,
      [AACategory.EKONOMI]: 3,
      [AACategory.DUNYA]: 4,
      [AACategory.SPOR]: 5,
      [AACategory.SAGLIK]: 6,
      [AACategory.TEKNOLOJI]: 7,
      [AACategory.EGITIM]: 8,
      [AACategory.KULTUR]: 9,
      [AACategory.YASAM]: 10,
      [AACategory.FUTBOL]: 11,
      [AACategory.BASKETBOL]: 12,
      [AACategory.ANALIZ]: 13,
      [AACategory.KORONAVIRUS]: 14,
      [AACategory.VIDEO]: 15,
    };

    const sortedCategories = Array.from(items.entries()).sort(
      ([a], [b]) => categoryPriority[a] - categoryPriority[b],
    );

    for (let i = 0; i < sortedCategories.length; i += maxConcurrentCategories) {
      const categoryBatch = sortedCategories.slice(
        i,
        i + maxConcurrentCategories,
      );

      this.logger.log(
        `Processing category batch ${Math.floor(i / maxConcurrentCategories) + 1}/${Math.ceil(sortedCategories.length / maxConcurrentCategories)}`,
      );

      const categoryPromises = categoryBatch.map(
        async ([category, rawItems]) => {
          this.logger.log(
            `Processing ${rawItems.length} items from category: ${category}`,
          );

          const categoryProcessedItems: ProcessedNewsItem[] = [];

          // Kategorideki öğeleri parçalara bölerek işle
          for (let j = 0; j < rawItems.length; j += maxConcurrentItems) {
            const itemBatch = rawItems.slice(j, j + maxConcurrentItems);

            const itemPromises = itemBatch.map((item) =>
              this.processNewsItem(item, category),
            );

            const itemResults = await Promise.allSettled(itemPromises);

            itemResults.forEach((result, index) => {
              if (result.status === 'fulfilled' && result.value) {
                categoryProcessedItems.push(result.value);
              } else {
                this.logger.warn(
                  `Failed to process item ${j + index} from category ${category}`,
                );
              }
            });

            // Rate limiting - öğe grupları arasında bekle
            if (j + maxConcurrentItems < rawItems.length) {
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          }

          return categoryProcessedItems;
        },
      );

      const categoryResults = await Promise.all(categoryPromises);

      categoryResults.forEach((categoryItems) => {
        processedItems.push(...categoryItems);
      });

      // Rate limiting - kategori grupları arasında bekle
      if (i + maxConcurrentCategories < sortedCategories.length) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    this.logger.log(
      `Successfully processed ${processedItems.length} news items`,
    );
    return processedItems;
  }
}
