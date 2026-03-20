import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

export class ProductServie {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createProduct() {}
  async getProducts() {}
  async getProduct() {}
  async deleteProduct() {}
}
