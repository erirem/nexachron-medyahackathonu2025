'use client';

import { useState, useCallback, useEffect, type JSX } from 'react';
import Image from 'next/image';
import type { DashboardNewsItem, NewsImage } from './types';
import { useGamification } from '@/contexts/gamification-context';
import { RANK_INFO, Comment, XP_VALUES, UserRank } from '@/lib/types/gamification';

interface EnhancedNewsModalProps {
  readonly item: DashboardNewsItem;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly relatedNews?: readonly DashboardNewsItem[];
}

// Mock comments - gerçekte API'den gelecek
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    newsId: 'haber-1',
    userId: 'user-1',
    userProfile: {
      name: 'Mehmet Demir',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rank: 'EXPERT_COMMENTER' as UserRank,
      xp: 5200
    },
    content: 'BIST 100 endeksindeki bu yükseliş beklentilerin üzerinde. Özellikle bankacılık hisselerindeki güçlü performans, TCMB politikalarının piyasa tarafından olumlu karşılandığını gösteriyor.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    likes: 23,
    isLikedByUser: false,
    xpEarned: 20
  },
  {
    id: '2',
    newsId: 'haber-1',
    userId: 'user-2',
    userProfile: {
      name: 'Ayşe Kaya',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rank: 'ACTIVE_READER' as UserRank,
      xp: 850
    },
    content: 'Yabancı yatırımcıların ilgisi gerçekten dikkat çekici. Acaba bu trend sürdürülebilir mi?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    likes: 8,
    isLikedByUser: true,
    xpEarned: 20
  }
];

export function EnhancedNewsModal({ 
  item, 
  isOpen, 
  onClose, 
  relatedNews = [] 
}: EnhancedNewsModalProps): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'gallery' | 'related' | 'comments'>('content');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 156);
  const [isFollowingTopic, setIsFollowingTopic] = useState(false);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [hasReadArticle, setHasReadArticle] = useState(false);
  
  const { userProfile, addXP, followTopic, unfollowTopic } = useGamification();

  const allImages: NewsImage[] = [
    { url: item.imageUrl, alt: item.title, caption: item.title },
    ...(item.images ?? [])
  ];

  // Takip edilen konular kontrolü
  useEffect(() => {
    if (userProfile && item.tags.length > 0) {
      const mainTag = item.tags[0];
      setIsFollowingTopic(userProfile.followedTopics.includes(mainTag));
    }
  }, [userProfile, item.tags]);

  // Haber okunduğunda XP kazan
  useEffect(() => {
    if (isOpen && !hasReadArticle && activeTab === 'content') {
      const timer = setTimeout(() => {
        addXP('NEWS_READ');
        setHasReadArticle(true);
        
        // Trend haber ise ekstra XP
        if (item.tags.includes('trending') || item.impact === 'Yüksek') {
          addXP('NEWS_READ', XP_VALUES.TRENDING_TOPIC_READ);
        }
      }, 3000); // 3 saniye okuma süresi
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasReadArticle, activeTab, addXP, item.tags, item.impact]);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);
  
  const handleFollowTopic = useCallback(() => {
    if (item.tags.length > 0) {
      const mainTag = item.tags[0];
      if (isFollowingTopic) {
        unfollowTopic(mainTag);
      } else {
        followTopic(mainTag);
      }
      setIsFollowingTopic(!isFollowingTopic);
    }
  }, [isFollowingTopic, item.tags, followTopic, unfollowTopic]);
  
  const handleCommentSubmit = useCallback(() => {
    if (!newComment.trim() || !userProfile) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      newsId: item.id,
      userId: userProfile.id,
      userProfile: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        rank: userProfile.currentRank,
        xp: userProfile.xp
      },
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      isLikedByUser: false,
      xpEarned: XP_VALUES.COMMENT
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    addXP('COMMENT');
  }, [newComment, userProfile, item.id, comments, addXP]);
  
  const handleCommentLike = useCallback((commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        if (!comment.isLikedByUser) {
          addXP('COMMENT', XP_VALUES.COMMENT_LIKE);
        }
        return {
          ...comment,
          likes: comment.isLikedByUser ? comment.likes - 1 : comment.likes + 1,
          isLikedByUser: !comment.isLikedByUser
        };
      }
      return comment;
    }));
  }, [addXP]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return <></>;

  const fullContent = item.fullContent ?? `${item.summary}\n\n${item.detail}`;
  const paragraphs = fullContent.split('\n\n').filter(p => p.trim());

  return (
    <>
      {/* Enhanced Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - Fixed to prevent scrolling issues */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-7xl max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
          <div className="bg-gradient-to-br from-[#0a0f1a] via-[#0d1421] to-[#08111c] rounded-3xl shadow-2xl border border-white/10 flex flex-col max-h-full overflow-hidden">
            
            {/* Header */}
            <div className="relative">
              {/* Hero Image */}
              <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
                <Image
                  src={allImages[currentImageIndex]?.url || item.imageUrl}
                  alt={allImages[currentImageIndex]?.alt || item.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    
                    {/* Image Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                {/* Article Metadata Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm text-xs font-semibold text-blue-300 border border-blue-400/30">
                      {item.category}
                    </span>
                    {item.impact === 'Yüksek' && (
                      <span className="px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-sm text-xs font-semibold text-red-300 border border-red-400/30">
                        🔥 SON DAKİKA
                      </span>
                    )}
                    {/* Follow Topic Button */}
                    {item.tags.length > 0 && (
                      <button
                        onClick={handleFollowTopic}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isFollowingTopic
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        <span>{isFollowingTopic ? '✓' : '+'}</span>
                        <span>{isFollowingTopic ? 'Takip Ediliyor' : 'Konuyu Takip Et'}</span>
                      </button>
                    )}
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                    {item.title}
                  </h1>
                  
                  {item.subtitle && (
                    <p className="text-xl text-white/80 mb-4 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      {item.author?.avatar && (
                        <Image
                          src={item.author.avatar}
                          alt={item.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div className="text-white font-medium">{item.author?.name || 'AA Muhabiri'}</div>
                        <div className="text-xs">{item.author?.title || 'Anadolu Ajansı'}</div>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <span>{item.publishedAt || item.timestamp}</span>
                    <div className="h-8 w-px bg-white/20" />
                    <span>{item.readingTime}</span>
                    <div className="h-8 w-px bg-white/20" />
                    <span>{item.dateline}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-white/10 bg-black/20 flex-shrink-0">
              <div className="flex items-center px-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'content'
                      ? 'text-white border-blue-500'
                      : 'text-white/60 border-transparent hover:text-white/80'
                  }`}
                >
                  📰 Haberin Tamamı
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'comments'
                      ? 'text-white border-blue-500'
                      : 'text-white/60 border-transparent hover:text-white/80'
                  }`}
                >
                  💬 Yorumlar ({comments.length})
                </button>
                {allImages.length > 1 && (
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === 'gallery'
                        ? 'text-white border-blue-500'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                  >
                    🖼️ Galeri ({allImages.length})
                  </button>
                )}
                {relatedNews.length > 0 && (
                  <button
                    onClick={() => setActiveTab('related')}
                    className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === 'related'
                        ? 'text-white border-blue-500'
                        : 'text-white/60 border-transparent hover:text-white/80'
                    }`}
                  >
                    🔗 İlgili Haberler ({relatedNews.length})
                  </button>
                )}
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex flex-1 overflow-hidden">
              {/* Main Content */}
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                {activeTab === 'content' && (
                  <article className="prose prose-invert prose-lg max-w-none">
                    {/* Lead paragraph */}
                    <div className="text-xl leading-relaxed text-white/90 font-medium mb-8 border-l-4 border-blue-500 pl-6 bg-blue-500/5 py-4">
                      {item.summary}
                    </div>

                    {/* Article content */}
                    <div className="space-y-6">
                      {paragraphs.map((paragraph, index) => (
                        <p key={index} className="text-lg leading-relaxed text-white/85">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">🏷️ Etiketler</h3>
                      <div className="flex flex-wrap gap-3">
                        {item.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Source Attribution */}
                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                          AA
                        </div>
                        <div>
                          <div className="text-white font-semibold">Anadolu Ajansı</div>
                          <div className="text-white/60 text-sm">Türkiye&apos;nin Küresel Haber Ajansı</div>
                        </div>
                      </div>
                    </div>
                  </article>
                )}

                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">📸 Haber Galerisi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allImages.map((image, index) => (
                        <div key={index} className="group cursor-pointer" onClick={() => setCurrentImageIndex(index)}>
                          <div className="relative aspect-video rounded-xl overflow-hidden">
                            <Image
                              src={image.url}
                              alt={image.alt}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="10 8 16 12 10 16 10 8"/>
                              </svg>
                            </div>
                          </div>
                          {image.caption && (
                            <p className="text-white/70 text-sm mt-3">{image.caption}</p>
                          )}
                          {image.credit && (
                            <p className="text-white/50 text-xs mt-1">Fotoğraf: {image.credit}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'related' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">🔗 İlgili Haberler</h2>
                    <div className="space-y-4">
                      {relatedNews.slice(0, 5).map((news) => (
                        <div key={news.id} className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <div className="w-24 h-16 rounded-lg bg-white/10 flex-shrink-0 relative overflow-hidden">
                            <Image
                              src={news.imageUrl}
                              alt={news.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium line-clamp-2 mb-1">{news.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <span>{news.category}</span>
                              <span>•</span>
                              <span>{news.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">💬 Yorumlar</h2>
                      {userProfile && (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${RANK_INFO[userProfile.currentRank].bgColor} ${RANK_INFO[userProfile.currentRank].color} border ${RANK_INFO[userProfile.currentRank].borderColor}`}>
                            <span>{RANK_INFO[userProfile.currentRank].emoji}</span>
                            <span>{RANK_INFO[userProfile.currentRank].name}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Comment Input */}
                    {userProfile && (
                      <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-4">
                          {userProfile.avatar && (
                            <Image
                              src={userProfile.avatar}
                              alt={userProfile.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          )}
                          <div className="flex-1 space-y-3">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Fikirlerinizi paylaşın..."
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                              rows={3}
                            />
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-white/40">
                                {newComment.length}/500 karakter
                              </div>
                              <button
                                onClick={handleCommentSubmit}
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <span className="flex items-center gap-2">
                                  <span>Gönder</span>
                                  <span className="text-xs">+{XP_VALUES.COMMENT} XP</span>
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const rankInfo = RANK_INFO[comment.userProfile.rank];
                        return (
                          <div key={comment.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                            <div className="flex items-start gap-4">
                              {comment.userProfile.avatar && (
                                <Image
                                  src={comment.userProfile.avatar}
                                  alt={comment.userProfile.name}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-medium">{comment.userProfile.name}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${rankInfo.bgColor} ${rankInfo.color} border ${rankInfo.borderColor}`}>
                                    <span>{rankInfo.emoji}</span>
                                    <span>{rankInfo.name}</span>
                                  </span>
                                  <span className="text-xs text-white/40">
                                    {new Date(comment.timestamp).toLocaleString('tr-TR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: 'short'
                                    })}
                                  </span>
                                </div>
                                <p className="text-white/80 mb-3">{comment.content}</p>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleCommentLike(comment.id)}
                                    className={`flex items-center gap-2 text-sm transition-colors ${
                                      comment.isLikedByUser
                                        ? 'text-red-400'
                                        : 'text-white/60 hover:text-red-400'
                                    }`}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={comment.isLikedByUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                                    </svg>
                                    <span>{comment.likes}</span>
                                  </button>
                                  <span className="text-xs text-white/40">
                                    +{comment.xpEarned} XP kazandı
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Social Actions & Stats */}
              <div className="w-80 p-8 border-l border-white/10 bg-white/5 overflow-y-auto">
                {/* Social Actions */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-white">⚡ Etkileşim</h3>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                        isLiked 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                      {likeCount}
                    </button>

                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={`p-3 rounded-xl transition-all ${
                        isSaved 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>

                    <button className="p-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 transition-all">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <path d="M8.6 13.5l6.8 4m0-11l-6.8 4"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-white">📊 İstatistikler</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Okunma</span>
                      <span className="text-white font-medium">{item.viewCount ?? '2.3k'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Beğeni</span>
                      <span className="text-white font-medium">{likeCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Paylaşım</span>
                      <span className="text-white font-medium">{item.shareCount ?? 89}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Related */}
                {relatedNews.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">🔗 İlgili</h3>
                    <div className="space-y-3">
                      {relatedNews.slice(0, 3).map((news) => (
                        <div key={news.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                          <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">{news.title}</h4>
                          <div className="text-xs text-white/50">{news.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Article Button */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all">
                    📖 Tam Sayfada Oku
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}