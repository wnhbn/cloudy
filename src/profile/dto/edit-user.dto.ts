import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6)
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @Length(6)
  password?: string;
}
