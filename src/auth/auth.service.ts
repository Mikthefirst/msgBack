import { JwtUser } from 'src/types/userType';

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log(email, pass);
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    throw new BadRequestException("wrong credentials");
  }

  async login(user: JwtUser) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      email: user.email,
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }
}
