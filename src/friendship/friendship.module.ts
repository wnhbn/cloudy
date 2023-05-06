import { Friendship } from './../database/entity/friendship.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { User } from './../database/entity/user.entity';
import { FriendshipGateway } from './friendship.gateway';
import { Socket } from '../database/entity/socket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship, Socket])],
  providers: [FriendshipService, FriendshipGateway],
  controllers: [FriendshipController],
  exports: [FriendshipGateway],
})
export class FriendshipModule {}
