'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSupabaseClient } from '@/lib/supabase/client';

interface MultiplayerSocketEvents {
  // Server to client events
  playerJoined: (data: { participant: any; roomDetails: any; timestamp: Date }) => void;
  playerLeft: (data: { userId: string; roomDetails: any; timestamp: Date }) => void;
  roomJoined: (data: { participant: any; roomDetails: any; timestamp: Date }) => void;
  gameStarted: (data: { game: any; timestamp: Date }) => void;
  playerAnswered: (data: { userId: string; questionId: string; answer: string; isCorrect: boolean; score: number; timestamp: Date }) => void;
  nextQuestion: (data: { gameState: any; timestamp: Date }) => void;
  gameCompleted: (data: { results: any; timestamp: Date }) => void;
  answerResult: (data: { isCorrect: boolean; score: number; questionId: string }) => void;
  error: (data: { message: string }) => void;
}

interface MultiplayerSocketActions {
  joinRoom: (data: { roomId: string; playerName: string; password?: string }) => void;
  leaveRoom: (data: { roomId: string }) => void;
  startGame: (data: { roomId: string }) => void;
  answerQuestion: (data: { roomId: string; questionId: string; answer: string; timeSpent: number }) => void;
  nextQuestion: (data: { roomId: string }) => void;
  gameComplete: (data: { roomId: string }) => void;
}

export function useMultiplayerSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Get Supabase session for authentication
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          setError('No authentication token found');
          return;
        }

        // Create socket connection
        const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/multiplayer`, {
          auth: {
            token: session.access_token,
          },
          transports: ['websocket', 'polling'],
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('Connected to multiplayer server');
          setIsConnected(true);
          setError(null);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from multiplayer server');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
          console.error('Connection error:', err);
          setError(err.message);
          setIsConnected(false);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

      } catch (err) {
        console.error('Failed to initialize socket:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect');
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  // Event listeners
  const addEventListener = <K extends keyof MultiplayerSocketEvents>(
    event: K,
    handler: MultiplayerSocketEvents[K]
  ) => {
    if (socket) {
      socket.on(event, handler);
    }
  };

  const removeEventListener = <K extends keyof MultiplayerSocketEvents>(
    event: K,
    handler: MultiplayerSocketEvents[K]
  ) => {
    if (socket) {
      socket.off(event, handler);
    }
  };

  // Actions
  const actions: MultiplayerSocketActions = {
    joinRoom: (data) => {
      console.log('🔌 Socket.emit joinRoom:', data);
      if (socket) {
        socket.emit('joinRoom', data);
        console.log('🔌 joinRoom event emitted successfully');
      } else {
        console.error('🔌 Socket is null, cannot emit joinRoom');
      }
    },
    leaveRoom: (data) => {
      if (socket) {
        socket.emit('leaveRoom', data);
      }
    },
    startGame: (data) => {
      if (socket) {
        socket.emit('startGame', data);
      }
    },
    answerQuestion: (data) => {
      if (socket) {
        socket.emit('answerQuestion', data);
      }
    },
    nextQuestion: (data) => {
      if (socket) {
        socket.emit('nextQuestion', data);
      }
    },
    gameComplete: (data) => {
      if (socket) {
        socket.emit('gameComplete', data);
      }
    },
  };

  return {
    socket,
    isConnected,
    error,
    addEventListener,
    removeEventListener,
    actions,
  };
}
