import { Controller, Get, Param, Render, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

// @UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':slug')
  @Render('chat/home')
  protected async getConversations(
    @Param('slug') slug: string,
    @Req() req: any,
  ): Promise<Object> {
    return await this.chatService.getConversations(slug, req);
  }

  @Get('')
  @Render('chat/home')
  protected async home(): Promise<void> {}
}
