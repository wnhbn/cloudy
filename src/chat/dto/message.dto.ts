import { Conversation } from '../../database/entity/conversation.entity';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { User } from '../../database/entity/user.entity';
import { DeepPartial } from 'typeorm';

export class MessageDto {
  conversation: any;

  senderId: DeepPartial<User>;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  files: Record<string, any>;
}
