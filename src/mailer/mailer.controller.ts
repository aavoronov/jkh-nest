import { Controller, Inject } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('mailer')
@ApiTags('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService, // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
}
