import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { ENV } from 'src/ENV';

@Injectable()
export class UserJob {
  constructor(@InjectQueue('userQueue') private userQueue: Queue) {}
  async add(jobName: string, data: any): Promise<any> {
    console.log('add new job ', jobName);
    this.userQueue.add(jobName, data, {
      delay: +ENV.QUEUE_DELAY,
      attempts: +ENV.QUEUE_ATTEMPTS,
      backoff: +ENV.QUEUE_BACKOFF,
      timeout: +ENV.QUEUE_TIMEOUT,
    });
  }
}
