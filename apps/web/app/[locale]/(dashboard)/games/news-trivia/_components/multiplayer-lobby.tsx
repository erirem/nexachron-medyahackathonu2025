'use client';

import { useState, type JSX } from 'react';
import { createGameRoom, joinGameRoom, getGameRooms } from '@/services/api';

interface GameRoom {
  id: string;
  name: string;
  gameType: string;
  maxPlayers: number;
  currentPlayers: string[];
  isPrivate: boolean;
  status: string;
  createdAt: string;
  createdBy: string;
}

interface MultiplayerLobbyProps {
  onRoomJoined: (roomId: string) => void;
  onRoomCreated: (roomId: string) => void;
}

export function MultiplayerLobby({ onRoomJoined, onRoomCreated }: MultiplayerLobbyProps): JSX.Element {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Create room form state
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  // Join room form state
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getGameRooms('news_trivia', 'waiting', 20);
      setRooms(data.rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const roomData = await createGameRoom({
        gameType: 'news_trivia',
        roomName: roomName.trim(),
        maxPlayers: 8,
        isPrivate,
        password: isPrivate ? password : undefined,
      });

      onRoomCreated(roomData.room.id);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string, password?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await joinGameRoom(roomId, {
        playerName: 'You',
        password,
      });

      onRoomJoined(roomId);
    } catch (error) {
      console.error('Failed to join room:', error);
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWithId = async () => {
    if (!joinRoomId.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      await joinGameRoom(joinRoomId.trim(), {
        playerName: 'You',
        password: joinPassword || undefined,
      });

      onRoomJoined(joinRoomId.trim());
    } catch (error) {
      console.error('Failed to join room:', error);
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Çok Oyunculu Trivia
        </h1>
        <p className="text-white/80">
          Oda oluşturun veya mevcut oyunlara katılın
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-semibold"
        >
          Oda Oluştur
        </button>
        <button
          onClick={() => setShowJoinForm(!showJoinForm)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors font-semibold"
        >
          ID ile Katıl
        </button>
        <button
          onClick={loadRooms}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors font-semibold"
        >
          Yenile
        </button>
      </div>

      {/* Create Room Form */}
      {showCreateForm && (
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Yeni Oda Oluştur</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Oda Adı
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Oda adını girin"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="private" className="text-sm text-white/80">
                Özel Oda
              </label>
            </div>
            {isPrivate && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifre girin"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCreateRoom}
                disabled={isLoading || !roomName.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Oluşturuluyor...' : 'Oda Oluştur'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Form */}
      {showJoinForm && (
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">ID ile Katıl</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Oda ID
              </label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Oda ID'sini girin"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Şifre (özel oda ise)
              </label>
              <input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Şifre girin"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleJoinWithId}
                disabled={isLoading || !joinRoomId.trim()}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Katılıyor...' : 'Odaya Katıl'}
              </button>
              <button
                onClick={() => setShowJoinForm(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Rooms */}
      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Mevcut Odalar</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Odalar yükleniyor...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60">Mevcut oda yok. Bir tane oluşturun!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{room.name}</h4>
                  <span className="text-sm text-white/60">
                    {room.currentPlayers.length}/{room.maxPlayers} oyuncu
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/60">
                    {room.isPrivate ? '🔒 Özel' : '🌐 Genel'}
                  </span>
                  <span className="text-sm text-white/60">
                    {new Date(room.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-colors"
                >
                  Odaya Katıl
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
