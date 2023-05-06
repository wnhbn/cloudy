import { User } from '../../database/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SECRET_KEY } from '../../util/secret.util';
import { Repository } from 'typeorm';
import { NO_ACCOUNT_EXISTS } from '../../util/message.util';

Injectable();
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY,
    });
  }

  async validate(payload: { id: number; email: string }) {
    const account = await this.userRepo.findOne({
      where: { email: payload.email },
    });

    if (!account) throw new HttpException(NO_ACCOUNT_EXISTS, 404);

    delete account.password;
    delete account.DeletedAt;
    return account;
  }
}
