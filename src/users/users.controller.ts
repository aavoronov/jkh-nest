import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileDto } from './dto/profile.dto';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { RestorePasswordDto } from './dto/restore.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('auth')
  authorizeByEmail(@Body() userData: UserDto) {
    return this.usersService.authorizeByEmail(userData);
  }

  @Get('confirm')
  confirmEmail(@Query('key') verification: string) {
    return this.usersService.confirmEmail(verification);
  }

  @Post('restore')
  restore(@Body() restoreData: RestorePasswordDto) {
    return this.usersService.restore(restoreData);
  }

  @Get('reauth')
  reauthorize(@Req() req) {
    return this.usersService.reauthorize(req);
  }

  @Post('update')
  update(@Req() req, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(req, updateData);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req);
  }

  @ApiExcludeEndpoint(true)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
