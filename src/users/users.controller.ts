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
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileDto } from './dto/profile.dto';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { RestorePasswordDto } from './dto/restore.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Base64 } from 'js-base64';

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          try {
            const fileName = Base64.encodeURI(
              (Math.random() * 1000).toString() + Date.now(),
            );
            console.log(file);
            const dbFileName =
              fileName +
              file.originalname.slice(file.originalname.lastIndexOf('.'));
            req.body.filename = dbFileName;
            cb(null, `${dbFileName}`);
          } catch (e) {
            console.log(e);
          }
        },
      }),
    }),
  )
  update(@Req() req, @Body() updateData: UpdateUserDto) {
    console.log(updateData);
    return this.usersService.update(req, updateData);
  }

  @Post('updateEmail')
  updateEmail(@Req() req, @Body() updateData: UpdateEmailDto) {
    return this.usersService.updateEmail(req, updateData);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req);
  }

  @Post('delete/:email')
  delete(@Req() req, @Param('email') email: string) {
    return this.usersService.delete(req, email);
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
}
