import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailerService } from './mailer.service';

@Controller('mailer')
@ApiTags('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService, // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
}
