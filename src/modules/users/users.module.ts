import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FireBaseHttp } from 'src/http/firebaseHttp.service';
import { QueueModule } from '../queues/queue.module';
import { UserController } from './controllers/user.controller';
import { OtpEntity } from './entities/otp.entity';
import { RoleEntity } from './entities/role.entity';
import { UserEntity } from './entities/user.entity';
import { UserRoleEntity } from './entities/userRoles.entity';
import { OtpService } from './services/otp.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { UserRoleService } from './services/userRole.service';

const CONTROLLERS = [UserController];
const ENTITIES = [RoleEntity, UserRoleEntity, UserEntity, OtpEntity];
const SERVICES = [RoleService, UserRoleService, UserService, OtpService];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([...ENTITIES]), QueueModule],
  providers: [...SERVICES, ...CONTROLLERS, FireBaseHttp],
  controllers: [...CONTROLLERS],
  exports: [...SERVICES, ...CONTROLLERS],
})
export class UserModule {}
