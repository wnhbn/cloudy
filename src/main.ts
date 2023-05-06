import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { registerHelpers } from './middleware/helper';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.set('view options', { layout: '/layouts/main' });
  app.setViewEngine('hbs');

  hbs.registerPartials(join(__dirname, '..', '/views/partials'));

  registerHelpers();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.use(cookieParser());

  await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();
