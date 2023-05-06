import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FILE_SIZE_ERROR, STRANGE_FILE } from '../util/message.util';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        async filename(req, file, callback) {
          const uniqueSuffix: string = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const name: string = file.originalname.split('.')[0];
          const ext: string = extname(file.originalname);
          const fileName: string = `${name}-${uniqueSuffix}${ext}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException(STRANGE_FILE), false);
        }
        if (file.size > 5 * 1024 * 1024) {
          return callback(new BadRequestException(FILE_SIZE_ERROR), false);
        }
        callback(null, true);
      },
    }),
  )
  protected async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) creatorId: number,
    // @Res() res: any,
  ): Promise<Object> {
    return await this.conversationService.createConversation(
      createConversationDto,
      file,
      creatorId,
    );
  }
}
