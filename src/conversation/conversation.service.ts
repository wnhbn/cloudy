import { FriendshipGateway } from './../friendship/friendship.gateway';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../database/entity/conversation.entity';
import { User } from '../database/entity/user.entity';
import { In, Repository } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { EMPTY_IMAGE } from '../util/message.util';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly friendshipGateway: FriendshipGateway,
  ) {}

  public async createConversation(
    createConversationDto: CreateConversationDto,
    file: Express.Multer.File,
    id: number,
  ): Promise<Conversation> {
    try {
      const image = file.filename;
      // Find the user with that id
      const creator = await this.userRepository.findOne({ where: { id } });

      const { title, participants } = createConversationDto;
      const conversation = this.conversationRepository.create({
        title,
        image,
        creatorId: creator,
      });

      // Retrieves all users whose "id" is in the "participants" array and assigns them as participants of the conversation
      conversation.participants = await this.userRepository.findBy({
        id: In(participants),
      });
      const result = await this.conversationRepository.save(conversation);
      delete result.creatorId.password;
      delete result.creatorId.CreatedAt;
      delete result.creatorId.DeletedAt;
      result.participants.forEach((participant) => {
        delete participant.password;
        delete participant.CreatedAt;
        delete participant.DeletedAt;
      });

      // Conversation Gateway has a problem, temporary use Friendship Gateway
      await this.friendshipGateway.handleNotification(result);
      return result;
    } catch (error) {
      throw new BadRequestException(EMPTY_IMAGE);
    }
  }
}
