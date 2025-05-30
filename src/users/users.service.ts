import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtUser } from 'src/types/userType';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConversationToUser } from 'src/conversations/entities/conv-to-user.entity';

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
    return this.usersRepository.findOne({
      where: { email: user.email },
      select: [
        'id',
        'username',
        'nickname',
        'email',
        'full_name',
        'avatar',
        'role',
        'CreatedAt',
        'UpdatedAt',
      ],
    });
  }

  findOne(id: string) {
    return this.usersRepository.findOne({
      where: { id: id },
      select: [
        'id',
        'username',
        'nickname',
        'email',
        'full_name',
        'avatar',
        'role',
        'CreatedAt',
        'UpdatedAt',
      ],
    });
  }
  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Обновление пользователя (full_name, email, avatar и т.д.)
  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Если email или nickname меняется — проверим на уникальность
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email уже занят');
      }
    }
    if (updateUserDto.nickname && updateUserDto.nickname !== user.nickname) {
      const nickExists = await this.usersRepository.findOne({
        where: { nickname: updateUserDto.nickname },
      });
      if (nickExists) {
        throw new BadRequestException('Nickname уже занят');
      }
    }

    await this.usersRepository.update({ id }, updateUserDto);
    const updated = await this.usersRepository.findOne({ where: { id } });
    const { password, ...rest } = updated!;
    return rest;
  }

  // Удаление пользователя
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    await this.usersRepository.delete(id);
    return { message: 'Пользователь удалён' };
  }

  // Смена пароля
  async changePassword(
    id: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Проверяем старый пароль
    if (user.password !== dto.currentPassword) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }
    // Хешируем новый
    await this.usersRepository.update({ id }, { password: dto.newPassword });
    return { message: 'Пароль успешно изменён' };
  }
}
