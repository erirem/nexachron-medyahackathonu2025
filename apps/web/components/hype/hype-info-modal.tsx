'use client';

import { type JSX } from 'react';
import { useGamification } from '@/contexts/gamification-context';
import { UserRank, RANK_INFO } from '@/lib/types/gamification';

interface HypeInfoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function HypeInfoModal({ isOpen, onClose }: HypeInfoModalProps): JSX.Element {
  const { userProfile, calculateHypePower } = useGamification();

  if (!isOpen) return <></>;

  const currentRank = userProfile?.currentRank || UserRank.NEW_MEMBER;
  const currentHypePower = calculateHypePower(currentRank);
  const currentRankInfo = RANK_INFO[currentRank];

  const getNextRankInfo = () => {
    const ranks = Object.values(UserRank);
    const currentIndex = ranks.indexOf(currentRank);
    if (currentIndex < ranks.length - 1) {
      const nextRank = ranks[currentIndex + 1];
      return {
        rank: nextRank,
        info: RANK_INFO[nextRank],
        hypePower: calculateHypePower(nextRank)
      };
    }
    return null;
  };

  const nextRankInfo = getNextRankInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-b border-white/10 rounded-t-3xl">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hype Sistemi</h2>
                <p className="text-white/70">Haberleri öne çıkarma gücünüz</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What is Hype */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Hype Nedir?
            </h3>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-white/90 leading-relaxed mb-4">
                <strong className="text-purple-400">Hype</strong>, bir haberi öne çıkarma ve daha fazla kişinin görmesini sağlama gücünüzdür. 
                Rankınıza göre hype gücünüz değişir ve daha yüksek ranklar daha fazla hype verebilir.
              </p>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/20">
                <p className="text-white/80 text-sm">
                  💡 <strong>İpucu:</strong> Hype verdiğiniz haberler daha fazla görünürlük kazanır ve topluluk tarafından daha çok fark edilir.
                </p>
              </div>
            </div>
          </section>

          {/* Current Status */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Mevcut Durumunuz
            </h3>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                  {currentRankInfo.emoji}
                </div>
                <div>
                  <h4 className={`text-xl font-bold ${currentRankInfo.color}`}>
                    {currentRankInfo.name}
                  </h4>
                  <p className="text-white/70">Mevcut Rankınız</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-400">+{currentHypePower}</div>
                  <div className="text-white/70 text-sm">Hype Gücü</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-400">{userProfile?.xp || 0}</div>
                  <div className="text-white/70 text-sm">Toplam XP</div>
                </div>
              </div>
            </div>
          </section>

          {/* Rank System */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-2.99 1.42c-.8.38-1.74-.1-1.74-.99V14.66"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21l2.99 1.42c.8.38 1.74-.1 1.74-.99V14.66"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              Rank Sistemi
            </h3>
            <div className="space-y-3">
              {Object.values(UserRank).map((rank) => {
                const rankInfo = RANK_INFO[rank];
                const hypePower = calculateHypePower(rank);
                const isCurrentRank = rank === currentRank;
                const isNextRank = nextRankInfo?.rank === rank;
                
                return (
                  <div 
                    key={rank}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      isCurrentRank 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30' 
                        : isNextRank
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="text-2xl">{rankInfo.emoji}</div>
                    <div className="flex-1">
                      <div className={`font-semibold ${rankInfo.color}`}>
                        {rankInfo.name}
                        {isCurrentRank && <span className="ml-2 text-xs bg-blue-500/20 px-2 py-1 rounded-full">Mevcut</span>}
                        {isNextRank && <span className="ml-2 text-xs bg-yellow-500/20 px-2 py-1 rounded-full">Sonraki</span>}
                      </div>
                      <div className="text-white/60 text-sm">
                        +{hypePower} hype gücü
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/70 text-sm">XP Gereksinimi</div>
                      <div className="font-semibold text-white">
                        {rank === UserRank.NEW_MEMBER ? '0' : 
                         rank === UserRank.ACTIVE_READER ? '500' :
                         rank === UserRank.KNOWLEDGE_SHARER ? '2,000' :
                         rank === UserRank.EXPERT_COMMENTER ? '5,000' :
                         '10,000+'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How to Level Up */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Rank Atlama Yolları
            </h3>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-400/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    Haber Okuma
                  </h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Haber okuma: <span className="text-green-400 font-semibold">+10 XP</span></li>
                    <li>• Haber tamamlama: <span className="text-green-400 font-semibold">+25 XP</span></li>
                    <li>• Hızlı okuma: <span className="text-green-400 font-semibold">+100 XP</span></li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Oyunlar & Etkileşim
                  </h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Quiz tamamlama: <span className="text-blue-400 font-semibold">+30 XP</span></li>
                    <li>• Yorum yapma: <span className="text-blue-400 font-semibold">+20 XP</span></li>
                    <li>• Konu takibi: <span className="text-blue-400 font-semibold">+15 XP</span></li>
                  </ul>
                </div>
              </div>
              
              {nextRankInfo && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="font-semibold text-yellow-400">Sonraki Rank: {nextRankInfo.info.name}</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    <span className="text-yellow-400 font-semibold">+{nextRankInfo.hypePower}</span> hype gücüne sahip olmak için 
                    daha fazla haber okuyun ve oyunlar oynayın!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              İpuçları
            </h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Günlük Streak</h4>
                    <p className="text-white/80 text-sm">
                      Her gün giriş yaparak streak bonusları kazanın. 3, 7 ve 30 günlük streak'lerde büyük XP ödülleri var!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Çeşitli Aktivite</h4>
                    <p className="text-white/80 text-sm">
                      Sadece haber okumak yerine quiz çözün, yorum yapın ve farklı kategorilerden haberler okuyun.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Hype Stratejisi</h4>
                    <p className="text-white/80 text-sm">
                      Yüksek rankınızla hype verdiğiniz haberler daha fazla görünürlük kazanır. Hype gücünüzü akıllıca kullanın!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-t border-white/10 rounded-b-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-sm">
              Daha fazla XP kazanmak için aktif olun! 🚀
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Anladım
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
