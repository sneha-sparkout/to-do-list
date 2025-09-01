import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Get('/review-document/:id')
  findOne(@Param('id') id: string) {
    return this.adminService.reviewDocuments(id);
  }
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Patch('/update-status/:id')
  updateStatus(@Body() body: { status: 'approved'|'rejected'|'pending' }, @Param('id') id: string) {
    return this.adminService.documentStatus(id, body.status);
  }
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Get('user-details/:id')
  accessDetail(@Param('id') id: string) {
    return this.adminService.accessUserDetail(id);
  }
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Put('/block-unblock/:id')
  userBlockStatus(@Param('id') id: string, @Body() body: { isBlocked: boolean }){
    return this.adminService.blockUnblockUser(id, body.isBlocked)
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @Get('send-summary')
  async sendSummary(){
    await this.adminService.adminSummary()
  }
  
}
