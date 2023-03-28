import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserRoleEntity } from './userRoles.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true })
  metaKey: string;

  @OneToMany((type) => UserRoleEntity, (model) => model.role)
  userRoles?: UserRoleEntity[];

  constructor() {
    super();
  }
}
