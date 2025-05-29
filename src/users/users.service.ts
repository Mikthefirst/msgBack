import { Injectable, ConflictException } from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto) {
    try {
       const emailExists = await this.usersRepository.findOne({
         where: { email: createUserDto.email },
       });
       if (emailExists) throw new ConflictException('Email already in use');
       const nicknameExists = await this.usersRepository.findOne({
         where: { nickname: createUserDto.nickname },
       });
       if (nicknameExists)
         throw new ConflictException('Nickname already in use');

       const user = this.usersRepository.save(createUserDto);

       return user;
    } catch (error) {
      console.log(error);
    }
   
  }

  findAll() {
    return this.usersRepository.find({});
  }

  getInfo(user: JwtUser) {
    return this.usersRepository.findOne({ where: { email: user.email } });
  }

  findOne(id: string) {
    return this.usersRepository.findOne({ where: { id: id } });
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
