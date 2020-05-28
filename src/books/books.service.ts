import { Inject } from '@nestjs/common';

import { TenantService } from '../tenant/tenant-service.decorator';
import { TENANT_CONNECTION } from '../tenant/tenant.module';
import { Book } from './book.entity';

@TenantService()
export class BooksService {

  constructor(@Inject(TENANT_CONNECTION) private connection) { }

  async findAll(): Promise<Book[]> {
    const repository = await this.connection.getRepository(Book);
    return repository.find();
  }
}
