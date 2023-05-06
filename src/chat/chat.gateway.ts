import { Conversation } from './../database/entity/conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Message } from '../database/entity/message.entity';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { EMPTY_MESSAGE, INTRUDERS } from '../util/message.util';
import { BadRequestException } from '@nestjs/common';
// import * as path from 'path';
// import * as fs from 'fs';
// import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('joinConversation')
  public handleJoinConversation(client: any, conversation: string): void {
    client.join(conversation);
  }

  @SubscribeMessage('message')
  public async handleMessage(client: any, data: MessageDto): Promise<void> {
    const { conversation, senderId, message, files } = data;
    try {
      // Only users who are members of the chat are allowed to message
      const findUser = await this.conversationRepository
        .createQueryBuilder('conversation')
        .innerJoinAndSelect(
          'conversation.participants',
          'user',
          'user.id = :userId',
          { userId: senderId },
        )
        .where('conversation.id = :conversationId', {
          conversationId: conversation,
        })
        .getOne();
      if (findUser) {
        if (message == '') throw new BadRequestException(EMPTY_MESSAGE);
        this.server.to(conversation).emit('message', data);
        await this.messageRepository.save(data);
      } else {
        throw new BadRequestException(INTRUDERS);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // @SubscribeMessage('sendFiles')
  // public handleSendFiles(client: any, files: string[]): void {
  //   let fileNames = [];
  //   // Handle received files
  //   for (const [index, file] of files.entries()) {
  //     const data = file.split(',')[1];
  //     const buffer = Buffer.from(data, 'base64');
  //     const fileName = uuidv4();
  //     const filePath = path.join('public', 'files', `file-${index}-${fileName}.jpg`);
  //     fs.writeFileSync(filePath, buffer);
  //     fileNames.push(fileName);
  //   }
  //   console.log(fileNames)
  // }
}
