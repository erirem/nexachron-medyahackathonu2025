'use client';

import { useState, useRef, useEffect, type JSX } from 'react';
import Image from 'next/image';

interface MultimediaContentProps {
  readonly articleId: string;
}

// Simulated multimedia data
const multimediaData = {
  'haber-1': {
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
    audioClips: [
      {
        title: 'Uzman Yorumu: Dr. Mehmet Yılmaz',
        duration: '2:34',
        url: '/audio/expert-comment.mp3'
      }
    ],
    infographics: [
      {
        title: 'BIST 100 Yıllık Performans',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
      }
    ],
    timeline: [
      { time: '09:30', event: 'Piyasa açılışı - BIST 100: 9.750' },
      { time: '11:00', event: 'Bankacılık hisseleri yükselişe geçti' },
      { time: '14:30', event: 'Yabancı alımlar arttı' },
      { time: '18:00', event: 'Kapanış - BIST 100: 9.780 (+%3)' }
    ]
  },
  'haber-3': {
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
    audioClips: [
      {
        title: 'TAI Genel Müdürü Açıklama',
        duration: '3:12',
        url: '/audio/tai-announcement.mp3'
      }
    ],
    infographics: [
      {
        title: 'Türkiye İHA Teknoloji Haritası',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80'
      }
    ],
    timeline: [
      { time: '2019', event: 'Proje başlangıcı' },
      { time: '2022', event: 'İlk prototip uçuşu' },
      { time: '2023', event: 'Seri üretim hazırlığı' },
      { time: '2024', event: 'Kara Kuvvetleri\'ne teslimat' }
    ]
  }
};

export function MultimediaContent({ articleId }: MultimediaContentProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'infographic' | 'timeline'>('video');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const data = multimediaData[articleId as keyof typeof multimediaData];

  useEffect(() => {
    if (!data) return;
    
    const video = videoRef.current;
    if (video) {
      const handlePlay = () => setIsVideoPlaying(true);
      const handlePause = () => setIsVideoPlaying(false);
      
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      
      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [data]);

  if (!data) return <></>;

  const playVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const playAudio = (audioClip: typeof data.audioClips[0]) => {
    if (currentAudio === audioClip.title) {
      audioRef.current?.pause();
      setCurrentAudio(null);
    } else {
      setCurrentAudio(audioClip.title);
      // In a real app, you'd load and play the audio file
    }
  };

  return (
    <section className="mt-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            İnteraktif İçerik
          </h2>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Zengin Medya
          </div>
        </div>
        <div className="bg-slate-800/20 border border-slate-600/30 rounded-2xl p-6">
          <p className="text-slate-300 text-base leading-relaxed mb-4">
            Haberi çok boyutlu olarak deneyimleyin. Video içerikler, uzman yorumları, infografikler ve zaman akışı ile konuyu derinlemesine keşfedin.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Video İçerikler</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Ses Kayıtları</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Görsel Analizler</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Kronolojik Sıra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {data.videoUrl && (
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'video'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            🎥 Video
          </button>
        )}
        {data.audioClips.length > 0 && (
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'audio'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            🎵 Ses
          </button>
        )}
        {data.infographics.length > 0 && (
          <button
            onClick={() => setActiveTab('infographic')}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'infographic'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            📊 İnfografik
          </button>
        )}
        {data.timeline.length > 0 && (
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            ⏱️ Zaman Akışı
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
        {/* Video Tab */}
        {activeTab === 'video' && data.videoUrl && (
          <div className="space-y-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"
              >
                <source src={data.videoUrl} type="video/mp4" />
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
              
              {/* Video Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-transparent to-black/20">
                <button
                  onClick={playVideo}
                  className={`w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-xl border-4 border-white/20 flex items-center justify-center transition-all duration-300 ${isVideoPlaying ? 'scale-90' : 'hover:scale-110'} group`}
                >
                  {isVideoPlaying ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1 group-hover:ml-2 transition-all">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Özel Haber Videosu</h3>
                    <p className="text-white/80 text-sm flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                      </svg>
                      Anadolu Ajansı özel görüntüleri
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Video Stats */}
            <div className="flex items-center justify-center gap-8 py-4 px-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-center">
                <div className="text-white font-semibold">HD Kalite</div>
                <div className="text-white/60 text-sm">1080p</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-semibold">Süre</div>
                <div className="text-white/60 text-sm">3:45</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-semibold">Boyut</div>
                <div className="text-white/60 text-sm">24 MB</div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Tab */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {data.audioClips.map((clip, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                <button
                  onClick={() => playAudio(clip)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentAudio === clip.title
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/20'
                  }`}
                >
                  {currentAudio === clip.title ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"/>
                      <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{clip.title}</h3>
                  <p className="text-white/60 text-sm">Süre: {clip.duration}</p>
                </div>
                
                {currentAudio === clip.title && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-green-400 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-green-400 text-sm">Çalıyor...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Infographic Tab */}
        {activeTab === 'infographic' && (
          <div className="space-y-6">
            {data.infographics.map((infographic, index) => (
              <div key={index} className="text-center">
                <h3 className="text-white font-semibold mb-4">{infographic.title}</h3>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/10">
                  <Image
                    src={infographic.imageUrl}
                    alt={infographic.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm">
                    💾 İndir
                  </button>
                  <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm">
                    🔍 Büyük Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-center mb-8">📅 Olayların Kronolojik Sırası</h3>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600"></div>
              
              <div className="space-y-8">
                {data.timeline.map((item, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Timeline Dot */}
                    <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xs">{item.time}</span>
                    </div>
                    
                    {/* Timeline Content */}
                    <div className="flex-1 pb-8">
                      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                        <p className="text-white font-medium leading-relaxed">{item.event}</p>
                        {index === data.timeline.length - 1 && (
                          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Güncel
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />
    </section>
  );
}