import { User } from '../database/entity/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from '../database/entity/friendship.entity';
import { In, Repository } from 'typeorm';
import { FriendshipDTO } from './dto/friendship.dto';
import { FRIENDSHIP_ERROR } from '../util/message.util';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  public async createFriendship(
    friendshipDTO: FriendshipDTO,
  ): Promise<Friendship> {
    let { user1, user2 } = friendshipDTO;
    user1 = await this.userRepository.findOne({ where: { id: user1 } });
    user2 = await this.userRepository.findOne({ where: { id: user2 } });
    if (user1 === null || user2 === null)
      throw new BadRequestException(FRIENDSHIP_ERROR);
    return await this.friendshipRepository.save(friendshipDTO);
  }

  public async takeFriendshipById(id: number): Promise<object> {
    const friendship = await this.friendshipRepository.find({
      where: [
        { user1: { id: In([id]) }, isFriends: true },
        { user2: { id: In([id]) }, isFriends: true },
      ],
      relations: ['user1', 'user2'],
    });
    return friendship.map((f) => ({
      ...f,
      user1:
        f.user1.id === id
          ? undefined
          : {
              ...f.user1,
              password: undefined,
              CreatedAt: undefined,
              DeletedAt: undefined,
            },
      user2:
        f.user2.id === id
          ? undefined
          : {
              ...f.user2,
              password: undefined,
              CreatedAt: undefined,
              DeletedAt: undefined,
            },
    }));
  }
}
