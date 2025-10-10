import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MultiplayerService } from '../services/multiplayer.service';
import { SupabaseService } from '../../supabase/supabase.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  roomId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/multiplayer',
})
export class MultiplayerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MultiplayerGateway.name);

  constructor(
    private readonly multiplayerService: MultiplayerService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`No token provided for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Verify Supabase JWT token
      const { data: { user }, error } = await this.supabaseService.supabase.auth.getUser(token);
      
      if (error || !user) {
        this.logger.error(`Authentication failed for client ${client.id}: ${error?.message || 'No user found'}`);
        client.disconnect();
        return;
      }

      client.userId = user.id;
      this.logger.log(`Client ${client.id} authenticated as user ${client.userId}`);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    if (client.userId && client.roomId) {
      // Notify room that player left
      this.server.to(client.roomId).emit('playerLeft', {
        userId: client.userId,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; playerName: string; password?: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`User ${client.userId} joining room ${data.roomId}`);
      this.logger.log(`Join room data:`, { roomId: data.roomId, playerName: data.playerName, password: data.password });

      // Join the room
      await client.join(data.roomId);
      client.roomId = data.roomId;
      this.logger.log(`Client ${client.id} joined room ${data.roomId}`);

      // Add player to game room via service
      this.logger.log(`Calling multiplayerService.joinGame...`);
      const participant = await this.multiplayerService.joinGame(
        data.roomId,
        client.userId,
        data.playerName,
        data.password,
      );
      this.logger.log(`Participant created:`, participant);

      // Get updated room details
      const roomDetails = await this.multiplayerService.getGameRoomDetails(data.roomId);
      this.logger.log(`Room details:`, roomDetails);

      // Notify all clients in the room
      this.logger.log(`Emitting playerJoined to room ${data.roomId}`);
      this.server.to(data.roomId).emit('playerJoined', {
        participant,
        roomDetails,
        timestamp: new Date(),
      });

      // Send current room state to the joining client
      this.logger.log(`Emitting roomJoined to client ${client.id}`);
      client.emit('roomJoined', {
        participant,
        roomDetails,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Failed to join room: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      if (!client.userId || !client.roomId) {
        return;
      }

      this.logger.log(`User ${client.userId} leaving room ${data.roomId}`);

      // Remove player from game room
      await this.multiplayerService.leaveGame(data.roomId, client.userId);

      // Leave the socket room
      await client.leave(data.roomId);
      client.roomId = undefined;

      // Get updated room details
      const roomDetails = await this.multiplayerService.getGameRoomDetails(data.roomId);

      // Notify remaining clients
      this.server.to(data.roomId).emit('playerLeft', {
        userId: client.userId,
        roomDetails,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Failed to leave room: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`User ${client.userId} starting game in room ${data.roomId}`);

      // Start the game via service
      const game = await this.multiplayerService.startGame(data.roomId, client.userId);

      // Notify all clients in the room
      this.server.to(data.roomId).emit('gameStarted', {
        game,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Failed to start game: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('answerQuestion')
  async handleAnswerQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { 
      roomId: string; 
      questionId: string; 
      answer: string; 
      timeSpent: number;
    },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`User ${client.userId} answering question in room ${data.roomId}`);

      // Process answer via service
      const result = await this.multiplayerService.answerQuestion(
        data.roomId,
        client.userId,
        {
          questionId: data.questionId,
          answer: data.answer,
          timeSpent: data.timeSpent,
        },
      );

      // Notify all clients in the room about the answer
      this.server.to(data.roomId).emit('playerAnswered', {
        userId: client.userId,
        questionId: data.questionId,
        answer: data.answer,
        isCorrect: result.isCorrect,
        score: result.score,
        timestamp: new Date(),
      });

      // Send result back to the answering client
      client.emit('answerResult', result);

    } catch (error) {
      this.logger.error(`Failed to process answer: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('nextQuestion')
  async handleNextQuestion(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`User ${client.userId} moving to next question in room ${data.roomId}`);

      // Move to next question via service
      const gameState = await this.multiplayerService.nextQuestion(data.roomId, client.userId);

      // Notify all clients in the room
      this.server.to(data.roomId).emit('nextQuestion', {
        gameState,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Failed to move to next question: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('gameComplete')
  async handleGameComplete(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      this.logger.log(`User ${client.userId} completing game in room ${data.roomId}`);

      // Complete the game via service
      const results = await this.multiplayerService.completeGame(data.roomId, client.userId);

      // Notify all clients in the room
      this.server.to(data.roomId).emit('gameCompleted', {
        results,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Failed to complete game: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}
