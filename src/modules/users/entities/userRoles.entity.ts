import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { RelationIdAttribute } from 'typeorm/query-builder/relation-id/RelationIdAttribute';
import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

@Entity('user_roles')
export class UserRoleEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (model) => model.userRoles)
  user: RoleEntity;

  @RelationId((user: UserRoleEntity) => user.user)
  userId: string;

  @ManyToOne(() => RoleEntity, (model) => model.userRoles)
  role: RoleEntity;

  @RelationId((user: UserRoleEntity) => user.role)
  roleId: string;

  constructor() {
    super();
  }
}
