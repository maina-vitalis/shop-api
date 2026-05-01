import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { CloudinaryModule } from '../../shared/cloudinary/cloudinary.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
