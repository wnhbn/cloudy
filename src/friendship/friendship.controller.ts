import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { FriendshipDTO } from './dto/friendship.dto';
import { FriendshipService } from './friendship.service';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  protected async createFriendship(@Body() friendshipDTO: FriendshipDTO) {
    return await this.friendshipService.createFriendship(friendshipDTO);
  }

  @Get()
  protected async takeFriendshipById(
    @Query('id', ParseIntPipe) id: number,
  ): Promise<object> {
    return await this.friendshipService.takeFriendshipById(id);
  }
}
