'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';

interface ReaderEngagementProps {
  readonly articleId: string;
}

interface User {
  name: string;
  avatar: string;
  verified: boolean;
  badge?: string;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Reply[];
}

interface Reply {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
}

// Simulated user data
const currentUser = {
  name: 'Ahmet Yılmaz',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
  verified: true
};

// Simulated comments data
const commentsData: { [key: string]: Comment[] } = {
  'haber-1': [
    {
      id: '1',
      user: { 
        name: 'Elif Kaya', 
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0e4?auto=format&fit=crop&w=100&q=80',
        verified: false
      },
      content: 'Harika analiz! BIST 100\'ün bu performansı gerçekten de dikkat çekici. Özellikle bankacılık sektöründeki gelişmeler umut verici.',
      timestamp: '2 saat önce',
      likes: 12,
      replies: [
        {
          id: '1-1',
          user: { 
            name: 'Mehmet Özkan', 
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            verified: true,
            badge: 'Ekonomi Uzmanı'
          },
          content: 'Katılıyorum Elif. Bu trend sürdürülebilir görünüyor. TCMB politikalarının da etkisi büyük.',
          timestamp: '1 saat önce',
          likes: 8
        }
      ]
    },
    {
      id: '2',
      user: { 
        name: 'Can Demir', 
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        verified: false
      },
      content: 'Yabancı yatırımcı ilgisi artması çok önemli. Bu sinyaller pozitif.',
      timestamp: '45 dakika önce',
      likes: 7,
      replies: []
    }
  ],
  'default': [
    {
      id: '1',
      user: { 
        name: 'Ayşe Yılmaz', 
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        verified: true,
        badge: 'Haber Editörü'
      },
      content: 'Bu haber gerçekten önemli gelişmeleri içeriyor. Detaylı analiz için teşekkürler!',
      timestamp: '3 saat önce',
      likes: 15,
      replies: []
    },
    {
      id: '2',
      user: { 
        name: 'Fatih Özkan', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        verified: false
      },
      content: 'Çok faydalı bir haber. Bu tür analizlerin devamını bekliyoruz.',
      timestamp: '5 saat önce',
      likes: 8,
      replies: [
        {
          id: '2-1',
          user: { 
            name: 'Zeynep Kaya', 
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0e4?auto=format&fit=crop&w=100&q=80',
            verified: false
          },
          content: 'Katılıyorum, çok değerli bilgiler.',
          timestamp: '4 saat önce',
          likes: 3
        }
      ]
    },
    {
      id: '3',
      user: { 
        name: 'Emre Demir', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
        verified: false
      },
      content: 'Güzel bir haber. Teşekkürler!',
      timestamp: '6 saat önce',
      likes: 5,
      replies: []
    }
  ]
};

export function ReaderEngagement({ articleId }: ReaderEngagementProps): JSX.Element {
  const [comments, setComments] = useState(
    commentsData[articleId as keyof typeof commentsData] || commentsData['default'] || []
  );
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: currentUser,
      content: newComment,
      timestamp: 'Şimdi',
      likes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setShowCommentForm(false);
  };

  const toggleCommentLike = (commentId: string) => {
    const newLikedComments = new Set(likedComments);
    if (newLikedComments.has(commentId)) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'popular':
        return (b.likes + (likedComments.has(b.id) ? 1 : 0)) - (a.likes + (likedComments.has(a.id) ? 1 : 0));
      default:
        return 0;
    }
  });

  return (
    <section className="mt-16">
      {/* Comment Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <span className="text-2xl">🐬</span>
          Yorumlar
        </h2>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <span>{comments.length} yorum</span>
          <span>•</span>
          <span>{Math.floor(Math.random() * 5000) + 1000} görüntülenme</span>
          <span>•</span>
          <span>{comments.reduce((acc, comment) => acc + comment.likes + (comment.replies?.reduce((replyAcc, reply) => replyAcc + reply.likes, 0) || 0), 0)} beğeni</span>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        {!showCommentForm ? (
          <button
            onClick={() => setShowCommentForm(true)}
            className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="text-white/70">Bu haber hakkında ne düşünüyorsunuz?</div>
                <div className="text-white/50 text-sm mt-1">Yorumunuzu paylaşın...</div>
              </div>
            </div>
          </button>
        ) : (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-4">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold">{currentUser.name}</span>
                  {currentUser.verified && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 transition-colors"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white/50 text-sm">
                {newComment.length}/500 karakter
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment('');
                  }}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yorum Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            💭 Yorumlar ({comments.length})
          </h3>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/40"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>
        </div>
        
        {comments.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <div className="text-6xl mb-4">💬</div>
            <div className="text-lg font-semibold mb-2">Henüz yorum yok</div>
            <div>İlk yorumu yapan siz olun!</div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-4">
                  <Image
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-semibold">{comment.user.name}</span>
                      {comment.user.verified && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {comment.user.badge && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                          {comment.user.badge}
                        </span>
                      )}
                      <span className="text-white/50 text-sm">• {comment.timestamp}</span>
                    </div>
                    
                    <p className="text-white/85 leading-relaxed mb-3">{comment.content}</p>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                          likedComments.has(comment.id)
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                        <span className="text-sm">
                          {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                        </svg>
                        <span className="text-sm">Yanıtla</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-16 space-y-4 pt-4 border-t border-white/10">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <Image
                          src={reply.user.avatar}
                          alt={reply.user.name}
                          width={36}
                          height={36}
                          className="rounded-full"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{reply.user.name}</span>
                            {reply.user.verified && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            )}
                            {reply.user.badge && (
                              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                {reply.user.badge}
                              </span>
                            )}
                            <span className="text-white/40 text-xs">• {reply.timestamp}</span>
                          </div>
                          
                          <p className="text-white/80 text-sm leading-relaxed mb-2">{reply.content}</p>
                          
                          <button className="flex items-center gap-1 text-white/60 hover:text-red-400 transition-colors text-xs">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                            </svg>
                            {reply.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-16 mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <Image
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder={`${comment.user.name} kullanıcısına yanıt yazın...`}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 transition-colors text-sm"
                          rows={3}
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1.5 text-white/70 hover:text-white transition-colors text-sm"
                          >
                            İptal
                          </button>
                          <button className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm">
                            Yanıtla
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}