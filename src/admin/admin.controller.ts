import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtUser } from 'src/types/userType';

//@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Проверка доступа администратора
  @Get('check')
  @Roles(Role.ADMIN)
  checkAdminAccess() {
    return { message: 'Access granted: You are an admin' };
  }

  // Получить все групповые чаты
  @Get('groups')
  @Roles(Role.ADMIN)
  getAllGroups() {
    return this.adminService.getAllGroups();
  }

  // Получить участников группы
  @Get('groups/:groupId/participants')
  @Roles(Role.ADMIN)
  getGroupParticipants(@Param('groupId') groupId: string) {
    return this.adminService.getGroupParticipants(groupId);
  }

  // Получить количество участников в группе
  @Get('groups/:groupId/member-count')
  @Roles(Role.ADMIN)
  getGroupMemberCount(@Param('groupId') groupId: string) {
    return this.adminService.getGroupMemberCount(groupId);
  }

  // Получить сообщения группы
  @Get('groups/:groupId/messages')
  @Roles(Role.ADMIN)
  getGroupMessages(@Param('groupId') groupId: string) {
    console.log('message req was');
    return this.adminService.getGroupMessages(groupId);
  }

  @Get('new-groups')
  @Roles(Role.ADMIN)
  async getNewGroups(@Query('since') since: string) {
    return this.adminService.getNewGroups(new Date(since));
  }

  @Patch('groups/:groupId/ban')
  @Roles(Role.ADMIN)
  async banGroup(@Param('groupId') groupId: string) {
    return this.adminService.banGroup(groupId);
  }

  @Patch('groups/:groupId/unban')
  @Roles(Role.ADMIN)
  async unbanGroup(@Param('groupId') groupId: string) {
    return this.adminService.UnbanGroup(groupId);
  }

  // --- USERS --- //

  @Get('users')
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('user/ban/:userId')
  @Roles(Role.ADMIN)
  async banUser(
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.banUser(userId, reason);
  }

  @Patch('user/unban/:userId')
  @Roles(Role.ADMIN)
  async unbanUser(@Param('userId') userId: string) {
    return this.adminService.unbanUser(userId);
  }

  @Patch('user/make-admin/:userId')
  @Roles(Role.ADMIN)
  async makeUserAdmin(@Param('userId') userId: string) {
    return this.adminService.makeUserAdmin(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-admin')
  async checkIsAdmin(@Req() req) {
    const user: JwtUser = req.user;
    if (user.role === Role.ADMIN) {
      return true;
    }
    return false;
  }
}
