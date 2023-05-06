import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { User } from '../../database/entity/user.entity';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  image: string;

  @IsOptional()
  creatorId: User;

  // @IsArray()
  @IsNotEmpty()
  participants: string[];
}
