import { JwtUser } from 'src/types/userType';
import { ConflictException } from '@nestjs/common';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log(email, pass);
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    throw new BadRequestException('wrong credentials');
  }

  async login(user: JwtUser) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      email: user.email,
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Проверяем, существует ли пользователь
    const existingUser = await this.usersService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    //const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user: User|string = await this.usersService.create({
      ...createUserDto,
      password: createUserDto.password,
    });
    if (typeof user === 'object') {
      const payload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        email: user.email,
      };
    }
    else {
      throw new InternalServerErrorException("smth went wrong with your user creation");
    }
    
  }
}
