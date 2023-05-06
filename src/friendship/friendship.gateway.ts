import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from '../database/entity/socket.entity';
import { Server } from 'socket.io';
import { Friendship } from '../database/entity/friendship.entity';
import { User } from '../database/entity/user.entity';
import {
  ACCEPT_FRIEND_ERROR,
  FRIENDSHIP_ERROR,
  FRIEND_ERROR,
} from '../util/message.util';
import { In, Repository } from 'typeorm';
import { FriendshipDTO } from './dto/friendship.dto';

@WebSocketGateway({
  namespace: 'friendship',
})
export class FriendshipGateway {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(Socket)
    private readonly socketRepository: Repository<Socket>,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('login')
  public async handleLogin(client: any, data: any): Promise<void> {
    const userExists = await this.socketRepository.findOne({
      where: { userId: data.userId },
    });
    if (userExists) {
      await this.socketRepository.update(userExists.id, {
        socketId: client.id,
      });
    } else {
      await this.socketRepository.save({
        socketId: client.id,
        userId: data.userId,
      });
    }
  }

  @SubscribeMessage('friendRequest')
  public async handleFriendRequest(
    client: any,
    data: FriendshipDTO,
  ): Promise<WsResponse<void>> {
    try {
      let { user1, user2 } = data;
      user1 = await this.userRepository.findOne({ where: { email: user1 } });
      user2 = await this.userRepository.findOne({ where: { email: user2 } });
      if (user1 === null || user2 === null)
        throw new BadRequestException(FRIENDSHIP_ERROR);
      const userId1 = user1.id;
      const userId2 = user2.id;

      const friendshipExists = await this.friendshipRepository
        .createQueryBuilder('friendship')
        .where(
          '(friendship.user1 = :user1 AND friendship.user2 = :user2) OR (friendship.user1 = :user2 AND friendship.user2 = :user1)',
          { user1: userId1, user2: userId2 },
        )
        .getOne();
      if (friendshipExists) {
        throw new BadRequestException(FRIEND_ERROR);
      }
      const friendship = await this.friendshipRepository.save({
        user1: userId1,
        user2: userId2,
      });

      const senderfullName = user1.fullName;
      const senderId = user1.id;

      // Get the socketId of user2 from the database
      const user2Socket = await this.socketRepository.findOne({
        where: { userId: userId2 },
      });
      if (user2Socket) {
        // Send the friend request notification to user2
        this.server.to(user2Socket.socketId).emit('newFriendRequest', {
          senderId,
          senderfullName,
          message: `${senderfullName} has sent you a friend request!`,
        });
      }
      return;
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  public async handleAcceptFriendRequest(
    client: any,
    data: any,
  ): Promise<void> {
    let { user1, user2, isFriends } = data;
    if (isFriends) {
      const friendshipExists = await this.friendshipRepository
        .createQueryBuilder('friendship')
        .where(
          '(friendship.user1 = :user1 AND friendship.user2 = :user2) OR (friendship.user1 = :user2 AND friendship.user2 = :user1)',
          { user1, user2 },
        )
        .getOne();
      if (friendshipExists) {
        await this.friendshipRepository.update(friendshipExists.id, {
          user1,
          user2,
          isFriends: true,
        });
        // Get the sender, receiver from the database
        const senderSocket = await this.socketRepository.findOne({
          where: { userId: user1 },
        });
        const receiverSocket = await this.socketRepository.findOne({
          where: { userId: user2 },
        });

        const sender = await this.userRepository.findOne({
          where: { id: user1 },
        });
        const receiver = await this.userRepository.findOne({
          where: { id: user2 },
        });
        if (senderSocket) {
          this.server.to(senderSocket.socketId).emit('friendAccepted', {
            user: {
              id: receiver.id,
              fullName: receiver.fullName,
            },
            message: `${receiver.fullName} has accepted your new friend request!`,
          });

          this.server.to(receiverSocket.socketId).emit('friendAccepted', {
            user: {
              id: sender.id,
              fullName: sender.fullName,
            },
            message: `Now you are ${sender.fullName}'s friend!`,
          });
        }
      } else {
        throw new BadRequestException(ACCEPT_FRIEND_ERROR);
      }
    } else {
      await this.friendshipRepository.delete({ user1, user2, isFriends });
    }
  }

  // Conversation Gateway has a problem, temporary use
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
