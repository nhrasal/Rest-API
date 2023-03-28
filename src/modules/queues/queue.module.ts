import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { UserJob } from './jobs/user.job';
import { userQueueService } from './services/user.service';
const SERVICES = [UserJob, userQueueService];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'userQueue',
    }),
  ],

  providers: [...SERVICES],
  exports: [...SERVICES],
})
export class QueueModule {}
