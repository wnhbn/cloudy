import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
export class FriendshipDTO {
  @IsNotEmpty()
  @IsNumberString()
  user1: any;

  @IsNotEmpty()
  @IsNumberString()
  user2: any;

  @IsOptional()
  @IsBoolean()
  isFriends?: boolean;
}
