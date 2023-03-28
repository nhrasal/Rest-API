import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Scope } from 'typeorm-scope';
import { UserEntity } from './user.entity';

@Scope<OtpEntity>([(qb, alias) => qb.andWhere(`${alias}.deletedAt IS NULL`)])
@Entity('otps')
export class OtpEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.otps)
  user: UserEntity;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  expireAt: Date;

  @Column({ nullable: true })
  token: string;

  @Column({ default: false })
  isVerified: boolean;
}
