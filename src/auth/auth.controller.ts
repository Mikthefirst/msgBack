import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Controller, Request, Post, UseGuards, Get, Res } from "@nestjs/common";
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService, 
    private readonly userService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req, @Res({passthrough: true}) res: Response) {
    
    const logindata = await this.authService.login(req.user);
    res.cookie("access_token", logindata.access_token, {
      //httpOnly: true, 
      maxAge: 3600000, 
      //sameSite: "strict", 
    });
    res.cookie("email", logindata.email);

    return { message: "Login successful", token:logindata.access_token };

  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return this.userService.getInfo(req.user);
  }
}
