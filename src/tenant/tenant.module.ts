import { BadRequestException, MiddlewareConsumer, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, createConnection, getConnection } from 'typeorm';

import { Tenant } from './tenant.entity';
import { Book } from '../books/book.entity';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
  ],
  providers: [
    {
      provide: TENANT_CONNECTION,
      inject: [
        REQUEST,
        Connection,
      ],
      scope: Scope.REQUEST,
      useFactory: async (request, connection) => {
        const tenant: Tenant = await connection.getRepository(Tenant).findOne(({ where: { host: request.headers.host } }));
        return getConnection(tenant.name);
      }
    }
  ],
  exports: [
    TENANT_CONNECTION
  ]
})
export class TenantModule {
  constructor(private readonly connection: Connection) { }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(async (req, res, next) => {

        const tenant: Tenant = await this.connection.getRepository(Tenant).findOne(({ where: { host: req.headers.host } }));

        if (!tenant) {
          throw new BadRequestException(
            'Database Connection Error',
            'There is a Error with the Database!',
          );
        }

        try {
          getConnection(tenant.name);
          next();
        } catch (e) {

          const createdConnection: Connection = await createConnection({
            name: tenant.name,
            type: "mysql",
            host: "localhost",
            port: 3307,
            username: 'root',
            password: 'root',
            database: tenant.name,
            entities: [ Book ],
            synchronize: true,
          })

          if (createdConnection) {
            next();
          } else {
            throw new BadRequestException(
              'Database Connection Error',
              'There is a Error with the Database!',
            );
          }
        }
      }).forRoutes('*');
  }
}

