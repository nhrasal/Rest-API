import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base/base.service';
import { UserTypesSeedData } from 'src/constants/seedData';
import { Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RoleService extends BaseService<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
  ) {
    super(roleRepo, RoleEntity);
  }

  async insertSeed(): Promise<any> {
    try {
      // console.log(UserTypesSeedData);
      const payload = await this.roleRepo.save(UserTypesSeedData);
      return payload;
    } catch (error) {
      return error;
    }
  }
}
