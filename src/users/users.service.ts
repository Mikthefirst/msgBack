import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtUser } from 'src/types/userType';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    this.usersRepository.save(createUserDto);

    return '';
  }

  findAll() {
    return this.usersRepository.find({});
  }

  getInfo(user: JwtUser) {
    return this.usersRepository.findOne({ where: { email: user.email } });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`
  }
  findOneByEmail(email: string) {
        return this.usersRepository.findOne({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
