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
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileDto } from './dto/profile.dto';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { RestorePasswordDto } from './dto/restore.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Base64 } from 'js-base64';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('worker')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'inn', maxCount: 1 },
      { name: 'contract', maxCount: 1 },
      { name: 'snils', maxCount: 1 },
    ]),
  )
  // uploadFile(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
  // console.log(files);
  createWorkerApplication(
    @Body() createWorkerProfileDto: CreateWorkerProfileDto,
    @UploadedFiles()
    files: {
      inn: Express.Multer.File;
      contract: Express.Multer.File;
      snils: Express.Multer.File;
    },
  ) {
    return this.usersService.createWorkerApplication(
      createWorkerProfileDto,
      files,
    );
    // console.log(createWorkerApplicationDto);
  }

  @Post('approve/:id')
  approveWorkerOrResetTheirPassword(@Param('id') id: string) {
    return this.usersService.approveWorkerOrResetTheirPassword(+id);
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
  update(@Req() req: any, @Body() updateData: UpdateUserDto) {
    console.log(updateData);
    return this.usersService.update(req, updateData);
  }

  @Post('updateEmail')
  updateEmail(@Req() req: any, @Body() updateData: UpdateEmailDto) {
    return this.usersService.updateEmail(req, updateData);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req);
  }

  @Delete('delete')
  delete(@Req() req: any) {
    return this.usersService.delete(req);
  }
}
