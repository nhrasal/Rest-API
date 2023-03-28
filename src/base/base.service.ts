import { FindAllSuccessResponse } from 'src/@responses/findAllSuccess.response';
import { SuccessResponse } from 'src/@responses/success.response';
import { paginationOptions } from 'src/utils/paginate.util';
import {
  orderByObjectBuilder,
  relationBuilder,
  selectArrayBuilder,
} from 'src/utils/utilFunc.util';
import { Raw, Repository } from 'typeorm';

type BaseUpdateReturn = {
  isUpdated: boolean;
  payload: any;
  error: any;
};

export abstract class BaseService<Entity> extends Repository<Entity> {
  repo: Repository<Entity>;
  entity: Entity;

  constructor(private repository: any, private ent: any) {
    super(ent, repository);
    this.repo = this.repository;
    this.entity = this.ent;
  }

  async getAll(options?: any): Promise<any> {
    const payload = await this.repo.findAndCount(options);
    return new SuccessResponse({
      payload: payload[0],
    });
  }

  async getAllWithRelations(options: any, relations?: any[]): Promise<any> {
    const entityAlias = this.repository?.metadata?.target?.name;
    const qb = this.repo.manager
      .getRepository(this.repository?.metadata?.target)
      .createQueryBuilder(entityAlias);
    let select: any;
    if (options?.where) {
      qb.where(options.where);
    }
    if (options?.select) {
      select = await selectArrayBuilder(entityAlias, options.select);
    }
    select ? qb.select(select) : null;
    if (relations) {
      await relationBuilder(qb, entityAlias, relations);
    }

    return await qb.getMany();
  }

  async store(data: any): Promise<any> {
    return await this.repo.save(data);
  }

  async storeWithTransaction(data: any, queryRunner: any): Promise<any> {
    return await queryRunner.manager.save(data);
  }

  async findSingle(options: any): Promise<any> {
    return await this.repo.findOne(options);
  }

  async findSingleOne(options: any, relations?: string[]): Promise<any> {
    console.log('log from findSingleOneWithQB from base :');
    const entityAlias = this.repository?.metadata?.tableMetadataArgs?.name;
    let select, order;
    if (options?.select) {
      select = await selectArrayBuilder(entityAlias, options.select);
    }
    if (options?.order) {
      order = await orderByObjectBuilder(entityAlias, options.order);
    }
    delete options.select;
    delete options.order;
    const qb = this.repo.manager
      .getRepository(this.repository?.metadata?.target)
      .createQueryBuilder(entityAlias);

    if (relations) {
      await relationBuilder(qb, entityAlias, relations);
    }

    options ? qb.where(options) : null;
    order ? qb.orderBy(order) : null;
    select ? qb.select(select) : null;
    return await qb.getOne();
  }

  async findAllWithPaginate(options: any, relations?: string[]): Promise<any> {
    const entityAlias = this.repository?.metadata?.tableMetadataArgs?.name;

    let select, order;
    if (options?.select) {
      select = await selectArrayBuilder(entityAlias, options.select);
    }
    if (options?.order) {
      order = await orderByObjectBuilder(entityAlias, options.order);
    } else {
      order = await orderByObjectBuilder(entityAlias, { updatedAt: 'DESC' });
    }
    delete options.select;
    delete options.order;
    const searchTerm = options.searchTerm;
    const searchAttributes = options.searchAttributes || ['name'];
    delete options.searchAttributes;
    delete options.searchTerm;

    if (options.take && options.take === 'all') {
      delete options.take;
      delete options.page;
      let andWhere: any = { ...options };

      if (searchTerm) {
        andWhere = [];
        if (searchAttributes) {
          searchAttributes.map((item: string) => {
            const attribute = { ...options };
            attribute[item] = Raw(
              (alias) => `${alias} ILIKE '%${searchTerm}%'`,
            );
            andWhere.push(attribute);
          });
        }
      }

      // options.where = andWhere;
      const qb = this.repo.manager
        .getRepository(this.repository?.metadata?.target)
        .createQueryBuilder(entityAlias);
      select ? qb.select(select) : null;
      options ? qb.where(andWhere) : null;
      order ? qb.orderBy(order) : null;

      if (relations) {
        await relationBuilder(qb, entityAlias, relations);
      }

      const payload = await qb.getManyAndCount();
      return new FindAllSuccessResponse({
        payload: payload[0],
        total: payload[1],
        take: 'all',
        page: false,
      });
    } else {
      const pOptions: any = paginationOptions(options);
      pOptions.page = options.page;
      delete options.page;
      delete options.take;

      let andWhere: any = { ...options };

      if (searchTerm) {
        andWhere = [];

        if (searchAttributes) {
          searchAttributes.map((item: string) => {
            const attribute = { ...options };
            attribute[item] = Raw(
              (alias) => `${alias} ILIKE '%${searchTerm}%'`,
            );

            andWhere.push(attribute);
          });
        }
      }

      const qb = this.repo.manager
        .getRepository(this.repository?.metadata?.target)
        .createQueryBuilder(entityAlias);
      options ? qb.where(andWhere) : null;
      order ? qb.orderBy(order) : null;
      select ? qb.select(select) : null;

      if (relations) {
        await relationBuilder(qb, entityAlias, relations);
      }

      pOptions.skip ? qb.skip(pOptions.skip) : null;
      pOptions.take ? qb.take(pOptions.take) : null;
      const payload = await qb.getManyAndCount();

      return new FindAllSuccessResponse({
        payload: payload[0],
        total: payload[1],
        page: pOptions.page,
        take: pOptions.take,
      });
    }
  }

  async findById(id: any, options?: any): Promise<any> {
    return await this.repo.findOne({ id, ...options });
  }

  async update(id: string, options: any): Promise<any> {
    return await this.repo.save({ id: id, ...options });
  }

  async bulkInsertWithTransaction(data: any, queryRunner: any): Promise<any> {
    return await queryRunner.manager.save(data);
  }
}
