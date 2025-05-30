import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //changeThen
  //@UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user')
  async findUser(@Req() req): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.getInfo(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // Удалить пользователя
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Смена пароля — принимает текущий и новый
  @UseGuards(JwtAuthGuard)
  @Post('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    // Проверим, что id совпадает с тем, кто залогинен (или роль ADMIN)
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Нельзя сменить чужой пароль');
    }
    return this.usersService.changePassword(id, changePasswordDto);
  }
}
