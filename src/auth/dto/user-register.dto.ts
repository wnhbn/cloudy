import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UserRegisterDto {
  id: number;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  username?: string;
}
