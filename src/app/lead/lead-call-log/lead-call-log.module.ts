import { Module } from '@nestjs/common';
import { PrismaAppModule } from 'prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { LeadCallLogController } from './lead-call-log.controller';
import { LeadCallLogResolver } from './lead-call-log.resolver';
import { LeadCallLogService } from './lead-call-log.service';

@Module({
  imports: [PrismaAppModule, AuthModule],
  controllers: [LeadCallLogController],
  providers: [LeadCallLogService, LeadCallLogResolver],
  exports: [LeadCallLogService],
})
export class LeadCallLogModule {}
