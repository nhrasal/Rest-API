import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Scope } from 'typeorm-scope';
import { OtpEntity } from './otp.entity';
import { UserRoleEntity } from './userRoles.entity';
@Scope<UserEntity>([(qb, alias) => qb.andWhere(`${alias}.deletedAt IS NULL`)])
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, default: false })
  emailVerified: boolean;

  // @Column({ nullable: true })
  // stripeCustomerId: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  token: string;

  // @Column({ nullable: true })
  // nextTicketNumber: string;

  @OneToMany((type) => UserRoleEntity, (model) => model.user)
  userRoles?: UserRoleEntity[];

  @OneToMany((type) => OtpEntity, (model) => model.user)
  otps?: OtpEntity[];

  constructor() {
    super();
  }
}
