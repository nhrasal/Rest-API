import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ormConfig } from "../ENV";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: ormConfig.type,
      host: ormConfig.host,
      port: ormConfig.port,
      username: ormConfig.username,
      password: ormConfig.password,
      database: ormConfig.database,
      autoLoadEntities: true,
      synchronize: true,
      autoReconnect: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
  ],
})
export class TypeORMModule {}
