//auth.controller.ts
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Controller, Request, Post, UseGuards, Get, Res, Body } from "@nestjs/common";
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const logindata = await this.authService.login(req.user);
    res.cookie('access_token', logindata.access_token, {
      maxAge: 3600000,
      secure: true, // обязательно для HTTPS (в том числе на Vercel/Render)
      sameSite: 'none', // обязательно для кросс-доменных куки
    });
    res.cookie('email', logindata.email, {
      maxAge: 3600000,
      secure: true, // обязательно для HTTPS (в том числе на Vercel/Render)
      sameSite: 'none', // обязательно для кросс-доменных куки
    });
    res.cookie('id', logindata.id, {
      maxAge: 3600000,
      secure: true, // обязательно для HTTPS (в том числе на Vercel/Render)
      sameSite: 'none', // обязательно для кросс-доменных куки
    });


    return { message: 'Login successful', token: logindata.access_token };
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, email } =
      await this.authService.register(createUserDto);

    res.cookie('access_token', access_token, {
      maxAge: 3600000,
      secure: true, // обязательно для HTTPS (в том числе на Vercel/Render)
      sameSite: 'none', // обязательно для кросс-доменных куки
    });

    return {
      message: 'User registered successfully',
      email,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('req', req.data)
    return this.userService.getInfo(req.user);
  }
}
