/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SignUpDTO {
  @ApiProperty({ example: 'Jhon' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ example: 'example@mail.com' })
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Password is required!' })
  password: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Confirm Password is required!' })
  confirmPassword: string;
}

export class LoginDTO {
  @ApiProperty({ example: 'example@mail.com' })
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Password is required!' })
  password: string;
}

export class ProfileUpdateDTO {
  @ApiProperty({ example: 'First Name' })
  @IsNotEmpty({ message: 'First name is required!' })
  firstName: string;

  @ApiProperty({ example: 'Last Name' })
  @IsNotEmpty({ message: 'Last name is required!' })
  lastName: string;

  @ApiProperty({ example: 'image file' })
  image?: any;

  @ApiProperty({ example: 'Mailing Address' })
  address?: string;

  @ApiProperty({ example: 'Phone number' })
  phone: string;
}

export class ForgotPasswordDTO {
  @ApiProperty({ example: 'Email' })
  // @IsEmail()
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;
}
export class OtpDTO {
  @ApiProperty({ example: '123456' })
  @IsNumber()
  @IsNotEmpty({ message: 'OTP code is required!' })
  otp: number;
}
export class PasswordUpdateDTO {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Password is required!' })
  password: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Confirm password is required!' })
  confirmPassword: string;
}
