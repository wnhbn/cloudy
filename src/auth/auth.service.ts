import { UserLoginDto } from './dto/user-login.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  SIGNUP_FAILED,
  WRONG_EMAIL,
  WRONG_PASSWORD,
} from '../util/message.util';
import { SALT_ROUNDS, SECRET_KEY } from '../util/secret.util';
import { Repository } from 'typeorm';
import { User } from '../database/entity/user.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(user: UserRegisterDto, res: any): Promise<object> {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email: user.email },
      });
      if (userExists) throw new HttpException(SIGNUP_FAILED, 401);

      let username = slugify(user.fullName, { lower: true });

      while (await this.isUsernameTaken(username)) {
        const uuid = uuidv4();
        username = `${username}-${uuid}`;
      }
      user.username = username;

      const password = user.password;
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      user.password = hash;

      const newUser = await this.userRepository.save(user);
      const token = await this.signToken(user.id, user.email);

      res.cookie('id', user.id, { maxAge: 3 * 24 * 60 * 60 * 1000 });
      res.cookie('email', user.email, { maxAge: 3 * 24 * 60 * 60 * 1000 });
      res.cookie('fullName', user.fullName, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
      res.cookie('token', token, { maxAge: 3 * 24 * 60 * 60 * 1000 });

      return res.redirect('/chat/cloudy');
    } catch (err) {
      throw err;
    }
  }

  public async login(user: UserLoginDto, res: any): Promise<object> {
    const userExists = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (userExists) {
      const isMatch = await bcrypt.compare(user.password, userExists.password);
      if (isMatch) {
        const token = await this.signToken(userExists.id, userExists.email);

        res.cookie('id', userExists.id, { maxAge: 3 * 24 * 60 * 60 * 1000 });
        res.cookie('email', userExists.email, {
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        res.cookie('fullName', userExists.fullName, {
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        res.cookie('token', token, { maxAge: 3 * 24 * 60 * 60 * 1000 });
        return res.redirect('/chat/cloudy');
      } else {
        throw new HttpException(WRONG_PASSWORD, 401);
      }
    }
    throw new HttpException(WRONG_EMAIL, 400);
  }

  private async isUsernameTaken(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    return user;
  }

  private async signToken(id: number, email: string): Promise<Object> {
    const payload = { id, email };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '3d',
      secret: SECRET_KEY,
    });
    return access_token;
  }
}
