import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    TenantModule,
  ],
  controllers: [
    BooksController
  ],
  providers: [
    BooksService
  ]
})
export class BooksModule {}
