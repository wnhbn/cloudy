import { Friendship } from 'src/database/entity/friendship.entity';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/database/entity/conversation.entity';
import { User } from 'src/database/entity/user.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Socket } from '../database/entity/socket.entity';
import { ConversationGateway } from './conversation.gateway';
import { FriendshipModule } from '../friendship/friendship.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Conversation, Socket, Friendship]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
    FriendshipModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationGateway],
})
export class ConversationModule {}
