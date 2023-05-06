import { Controller, Get, Param, Res } from '@nestjs/common';

@Controller('')
export class HomeController {
  @Get('logout')
  async deleteCookie(@Res({ passthrough: true }) res: any): Promise<object> {
    await res.clearCookie('id');
    await res.clearCookie('email');
    await res.clearCookie('fullName');
    await res.clearCookie('token');
    return await res.redirect('/auth');
  }

  @Get(':slug')
  findNotFound(@Param('slug') slug: string): string {
    return '<h1>404</h1>';
  }
}
