'use client';

import { type JSX } from 'react';

interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  hasAnswered: boolean;
}

interface MultiplayerResultsProps {
  players: Player[];
  onPlayAgain: () => void;
  onBackToGames: () => void;
}

export function MultiplayerResults({ 
  players, 
  onPlayAgain, 
  onBackToGames 
}: MultiplayerResultsProps): JSX.Element {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">Oyun Tamamlandı!</h2>
        <p className="text-white/80 text-lg">
          Çok oyunculu trivia için teşekkürler!
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-800/10 border border-purple-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-white mb-6">Final Skorları</h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`flex items-center justify-between bg-white/5 p-4 rounded-lg border-2 ${
                index === 0 
                  ? 'border-yellow-400 bg-yellow-500/10' 
                  : index === 1 
                  ? 'border-gray-300 bg-gray-500/10'
                  : index === 2
                  ? 'border-orange-400 bg-orange-500/10'
                  : 'border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : index === 1 
                    ? 'bg-gray-300 text-gray-700'
                    : index === 2
                    ? 'bg-orange-400 text-orange-900'
                    : 'bg-white/20 text-white/60'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium text-white">{player.name}</span>
                {index === 0 && (
                  <span className="text-yellow-400 font-semibold">👑 Kazanan!</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{player.score}</div>
                <div className="text-sm text-white/60">puan</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors text-lg font-semibold"
        >
          Tekrar Oyna
        </button>
        <button
          onClick={onBackToGames}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors text-lg font-semibold"
        >
          Oyunlara Dön
        </button>
      </div>

      {/* Fun stats */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-6 max-w-2xl mx-auto">
        <h4 className="text-lg font-semibold text-white mb-4">Oyun İstatistikleri</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="font-semibold text-white">Toplam Oyuncu</div>
            <div className="text-2xl font-bold text-blue-400">{players.length}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="font-semibold text-white">En Yüksek Skor</div>
            <div className="text-2xl font-bold text-green-400">
              {Math.max(...players.map(p => p.score))}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="font-semibold text-white">Ortalama Skor</div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length)}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="font-semibold text-white">Toplam Puan</div>
            <div className="text-2xl font-bold text-orange-400">
              {players.reduce((sum, p) => sum + p.score, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
