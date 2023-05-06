import { ProfileService } from './profile.service';
import { Body, Controller, Patch, Req } from '@nestjs/common';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch('edit')
  public async editUser(@Req() req: any, @Body() editUserDto: EditUserDto) {
    const userId = req.cookies.id;
    return await this.profileService.editUser(userId, editUserDto);
  }
}
