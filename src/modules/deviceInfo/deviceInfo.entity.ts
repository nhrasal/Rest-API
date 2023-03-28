import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity } from 'typeorm';
import { Scope } from 'typeorm-scope';

@Scope<DeviceEntity>([(qb, alias) => qb.andWhere(`${alias}.deletedAt IS NULL`)])
@Entity('devices')
export class DeviceEntity extends BaseEntity {
  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  baseOs: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  systemName: string;

  @Column({ nullable: true })
  uniqueId: string;

  @Column({ nullable: true })
  userAgent: string;

  constructor() {
    super();
  }
}
