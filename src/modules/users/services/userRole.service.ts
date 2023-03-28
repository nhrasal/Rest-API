import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { UserRoleEntity } from '../entities/userRoles.entity';

@Injectable()
export class UserRoleService extends BaseService<UserRoleEntity> {
  constructor(
    @InjectRepository(UserRoleEntity)
    private userRoleRepo: Repository<UserRoleEntity>,
  ) {
    super(userRoleRepo, UserRoleEntity);
  }
}
