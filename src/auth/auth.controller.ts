import { UserRegisterDto } from './dto/user-register.dto';
import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('')
  @Render('auth')
  public auth(): object {
    return {
      isAuthPage: true,
    };
  }

  @Post('register')
  public async register(
    @Body() user: UserRegisterDto,
    @Res() res: any,
  ): Promise<object> {
    return await this.authService.register(user, res);
  }

  @Post('login')
  public async login(
    @Body() user: UserLoginDto,
    @Res() res: any,
  ): Promise<object> {
    return await this.authService.login(user, res);
  }
}
