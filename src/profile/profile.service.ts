import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { Repository } from 'typeorm';
import { EditUserDto } from './dto/edit-user.dto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../util/secret.util';
import { EDITING_ERROR } from '../util/message.util';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getProfile(userId: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  public async editUser(
    userId: number,
    editUserDto: EditUserDto,
  ): Promise<object> {
    try {
      const password = editUserDto.password;
      if (password) {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        editUserDto.password = hash;
      }
      await this.userRepository.update(userId, editUserDto);
      delete editUserDto.password;
      return { message: 'Successfully updated!' };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new HttpException(EDITING_ERROR, 500);
      }
    }
  }
}
