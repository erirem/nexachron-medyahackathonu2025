/**
 * Game Participant Entity
 * Represents a player in a game
 */

export interface CreateGameParticipantData {
  gameId: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
}

export interface UpdateGameParticipantData {
  playerName?: string;
  playerAvatar?: string;
  isReady?: boolean;
  currentScore?: number;
  currentQuestionIndex?: number;
}

export class GameParticipantEntity {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  joinedAt: Date;
  isReady: boolean;
  currentScore: number;
  currentQuestionIndex: number;

  constructor(data: {
    id: string;
    game_id: string;
    player_id: string;
    player_name: string;
    player_avatar?: string;
    joined_at: string;
    is_ready: boolean;
    current_score: number;
    current_question_index: number;
  }) {
    this.id = data.id;
    this.gameId = data.game_id;
    this.playerId = data.player_id;
    this.playerName = data.player_name;
    this.playerAvatar = data.player_avatar;
    this.joinedAt = new Date(data.joined_at);
    this.isReady = data.is_ready;
    this.currentScore = data.current_score;
    this.currentQuestionIndex = data.current_question_index;
  }

  // Business logic methods
  isReadyToPlay(): boolean {
    return this.isReady;
  }

  isActive(): boolean {
    return this.currentQuestionIndex >= 0;
  }

  hasAnswered(): boolean {
    return this.currentQuestionIndex > 0;
  }

  getProgress(): number {
    // Assuming we know total questions from game context
    // This would need to be passed from the game
    return this.currentQuestionIndex;
  }

  addScore(points: number): void {
    this.currentScore += points;
  }

  resetScore(): void {
    this.currentScore = 0;
  }

  setReady(ready: boolean): void {
    this.isReady = ready;
  }

  moveToNextQuestion(): void {
    this.currentQuestionIndex++;
  }

  resetProgress(): void {
    this.currentQuestionIndex = 0;
    this.currentScore = 0;
  }

  getScore(): number {
    return this.currentScore;
  }

  getQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  isLeading(otherParticipants: GameParticipantEntity[]): boolean {
    return otherParticipants.every(participant => 
      participant.id === this.id || this.currentScore > participant.currentScore
    );
  }

  getRank(allParticipants: GameParticipantEntity[]): number {
    const sortedParticipants = allParticipants
      .sort((a, b) => b.currentScore - a.currentScore);
    
    return sortedParticipants.findIndex(p => p.id === this.id) + 1;
  }
}
