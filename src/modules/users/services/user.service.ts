import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base/base.service';
import { Connection, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRoleEntity } from '../entities/userRoles.entity';
@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private connection: Connection,
  ) {
    super(userRepo, UserEntity);
  }

  async signUp(userData: any, role: any): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // const dd = dtoToModelMapper(UserEntity, userData);

    try {
      const storeUser = await queryRunner.manager.save(UserEntity, userData);

      if (!storeUser) throw new BadGatewayException('Signup is not complete!');
      const userRole = await queryRunner.manager.save(UserRoleEntity, {
        role: role,
        user: storeUser,
      });
      if (!userRole) {
        await queryRunner.rollbackTransaction();
        throw new BadGatewayException('role not created');
      }
      await queryRunner.commitTransaction();
      return storeUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err;
      throw new BadGatewayException('role not created');
    } finally {
      await queryRunner.release();
    }
  }

  async findSingle(options: any): Promise<any> {
    return await this.userRepo.findOne(options);
  }

  async store(options: any): Promise<any> {
    return await this.userRepo.save(options);
  }

  async update(id: string, options: any): Promise<any> {
    return await this.userRepo.save({ id: id, ...options });
  }
}
