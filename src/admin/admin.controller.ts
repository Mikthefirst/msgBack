import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

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
    console.log('message req was')
    return this.adminService.getGroupMessages(groupId);
  }

  @Get('new-groups')
  @Roles(Role.ADMIN)
  async getNewGroups(@Query('since') since: string) {
    return this.adminService.getNewGroups(new Date(since));
  }
}
