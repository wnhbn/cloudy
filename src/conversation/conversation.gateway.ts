import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from '../database/entity/socket.entity';
import { In, Repository } from 'typeorm';

@WebSocketGateway({ namespace: 'conversation' })
export class ConversationGateway {
  constructor(
    @InjectRepository(Socket)
    private readonly socketRepository: Repository<Socket>,
  ) {}

  @WebSocketServer()
  server: Server;

  public async handleNotification(payload: any): Promise<void> {
    const userSockets = await this.socketRepository.find({
      where: { userId: In(payload.participants.map((p: any) => p.id)) },
    });

    userSockets.forEach((userSocket) => {
      this.server.to(userSocket.socketId).emit('handleNotification', {
        conversation: payload,
      });
    });
  }
}
