import { User } from '../database/entity/user.entity';
import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../database/entity/conversation.entity';
import { Friendship } from '../database/entity/friendship.entity';
import { Message } from '../database/entity/message.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getConversations(id: string, @Req() req: any): Promise<Object> {
    let currentId = await req.cookies.id;

    // Get current user
    const user = await this.userRepository.findOne({
      where: { id: currentId },
    });
    if (user) {
      delete user.password;
      delete user.DeletedAt;
    }

    // Calculate the total number of people participating in any chat
    const currentConversation: any = await this.conversationRepository.findOne({
      where: { id },
      relations: ['participants'],
    });
    const countParticipants = currentConversation?.participants.length || 0;

    // Get all the participants by conversation id
    const participants = currentConversation?.participants.map(
      (participant: any) => ({
        ...participant,
        password: undefined,
        DeletedAt: undefined,
      }),
    );

    // Get all conversations by current user
    const getConversationsByCurrentUser = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('participants.id IN (:...users)', { users: [currentId] })
      .getMany();

    // "participants" returns true if the user is in the conversation or false if not and discards unwanted data
    const conversations = getConversationsByCurrentUser.map((conversation) => ({
      ...conversation,
      participants: conversation.participants.length > 0,
    }));

    // Get conversation by id
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    // const conversationExists = await this.conversationRepository.findOneBy({
    //   id,
    // });
    const conversationExists = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('conversation.id = :id', { id })
      .andWhere('participants.id IN (:...users)', { users: [currentId] })
      .getOne();

    const countMessages = await this.messageRepository.count({
      where: {
        conversation: {
          id,
        },
      },
    });
    // Take messages by conversation
    let messages: Object;
    const skip = countMessages - 21 > 0 ? countMessages - 21 : 0;
    if (conversationExists) {
      messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.conversation', 'conversation')
        .leftJoinAndSelect('message.senderId', 'senderId')
        .select([
          'message',
          'conversation.id',
          'conversation.title',
          'conversation.image',
          'senderId.id',
          'senderId.fullName',
          'senderId.email',
          'senderId.username',
        ])
        .where('conversation.id = :id', { id })
        .skip(skip)
        .take(21)
        .getMany();
    }

    const lastMessages = [];
    for (const conversation of conversations) {
      const lastMessage = await this.messageRepository
        .createQueryBuilder('message')
        .select(['message.id', 'message.message', 'message.CreatedAt'])
        .leftJoin('message.senderId', 'user')
        .addSelect(['user.fullName'])
        .where('message.conversation = :conversationId', {
          conversationId: conversation.id,
        })
        .orderBy('message.CreatedAt', 'DESC')
        .getOne();
      if (lastMessage) {
        const conversationId: any = conversation.id;
        lastMessage.conversation = conversationId;
        lastMessages.push(lastMessage);
      } else {
        lastMessages.push({ conversation: conversation.id });
      }
    }

    // Friendship
    const friendshipByCurrentUser = await this.friendshipRepository.find({
      where: [
        { user1: { id: In([currentId]) }, isFriends: true },
        { user2: { id: In([currentId]) }, isFriends: true },
      ],
      relations: ['user1', 'user2'],
    });
    const friendship = friendshipByCurrentUser.map((f) => ({
      ...f,
      user1:
        f.user1.id == currentId
          ? undefined
          : {
              ...f.user1,
              password: undefined,
              CreatedAt: undefined,
              DeletedAt: undefined,
            },
      user2:
        f.user2.id == currentId
          ? undefined
          : {
              ...f.user2,
              password: undefined,
              CreatedAt: undefined,
              DeletedAt: undefined,
            },
    }));

    return {
      user,
      conversation,
      countParticipants,
      participants,
      conversations,
      messages,
      lastMessages,
      currentId,
      friendship,
    };
  }
}
