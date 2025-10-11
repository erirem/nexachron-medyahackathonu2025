/**
 * Game Room Entity
 * Represents a multiplayer game room
 */

import { GameType } from './game.entity';

export enum GameRoomStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateGameRoomData {
  gameId: string;
  name: string;
  gameType: GameType;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  createdBy: string;
}

export interface UpdateGameRoomData {
  name?: string;
  maxPlayers?: number;
  status?: GameRoomStatus;
  password?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export class GameRoomEntity {
  id: string;
  gameId: string;
  name: string;
  gameType: GameType;
  maxPlayers: number;
  currentPlayers: string[]; // Array of user IDs
  isPrivate: boolean;
  password?: string;
  status: GameRoomStatus;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  constructor(data: {
    id: string;
    game_id: string;
    name: string;
    game_type: string;
    max_players: number;
    current_players: string[] | null;
    is_private: boolean;
    password?: string;
    status: string;
    created_by: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
  }) {
    this.id = data.id;
    this.gameId = data.game_id;
    this.name = data.name;
    this.gameType = data.game_type as GameType;
    this.maxPlayers = data.max_players;
    this.currentPlayers = data.current_players || [];
    this.isPrivate = data.is_private;
    this.password = data.password;
    this.status = data.status as GameRoomStatus;
    this.createdBy = data.created_by;
    this.createdAt = new Date(data.created_at);
    this.startedAt = data.started_at ? new Date(data.started_at) : undefined;
    this.completedAt = data.completed_at ? new Date(data.completed_at) : undefined;
  }

  // Business logic methods
  isActive(): boolean {
    return this.status === GameRoomStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === GameRoomStatus.COMPLETED;
  }

  isWaiting(): boolean {
    return this.status === GameRoomStatus.WAITING;
  }

  isFull(): boolean {
    return this.currentPlayers.length >= this.maxPlayers;
  }

  isAvailable(): boolean {
    return this.isWaiting() && !this.isFull();
  }

  canJoin(): boolean {
    return this.isAvailable();
  }

  canStart(): boolean {
    return this.isWaiting() && this.currentPlayers.length > 0;
  }

  getPlayerCount(): number {
    return this.currentPlayers.length;
  }

  getAvailableSlots(): number {
    return Math.max(0, this.maxPlayers - this.currentPlayers.length);
  }

  hasPlayer(userId: string): boolean {
    return this.currentPlayers.includes(userId);
  }

  canPlayerJoin(userId: string): boolean {
    return this.canJoin() && !this.hasPlayer(userId);
  }

  getDuration(): number | null {
    if (this.startedAt && this.completedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }

  getDurationMinutes(): number | null {
    const duration = this.getDuration();
    return duration ? Math.round(duration / (1000 * 60)) : null;
  }

  isPasswordProtected(): boolean {
    return !!this.password;
  }

  validatePassword(password: string): boolean {
    return this.password === password;
  }
}
