import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private filterImageFiles(files: Express.Multer.File[]) {
    if (!files?.length) {
      return [];
    }

    return files.filter(
      (file) => file.fieldname === 'images' || !file.fieldname,
    );
  }

  private async uploadImages(files: Express.Multer.File[]) {
    const imageFiles = this.filterImageFiles(files);

    if (imageFiles.length === 0) {
      return [];
    }

    const uploadPromises = imageFiles.map(async (file, index) => {
      const result = await this.cloudinary.uploadFile(file);
      return {
        url: result.secure_url,
        alt: file.originalname,
        isPrimary: index === 0,
      };
    });

    return Promise.all(uploadPromises);
  }

  //create product
  async createProduct(
    storeId: string,
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const imageUrls = await this.uploadImages(files);

    const productData = {
      ...createProductDto,
      storeId,
      images: imageUrls,
    };

    try {
      return await this.prisma.product.create({
        data: productData,
      });
    } catch (error) {
      console.error('Prisma Create Error:', error);
      throw error;
    }
  }

  //get products for the current store
  async getProducts(storeId: string) {
    if (!storeId) {
      throw new ForbiddenException('Store ID is required to fetch products.');
    }
    return this.prisma.product.findMany({
      where: {
        storeId: storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  //get all the products(public route)
  async getAllProducts() {
    return this.prisma.product.findMany();
  }

  //get product by id
  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: {
        id: id,
      },
    });
  }

  async deleteProductById(id: string, storeId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found for this store or you do not have access.',
      );
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  //update product by id
  async updateProductById(
    id: string,
    storeId: string,
    updateProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const existing = await this.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!existing) {
      throw new NotFoundException(
        'Product not found for this store or you do not have access.',
      );
    }

    const imageUrls = await this.uploadImages(files);

    const productData = {
      ...updateProductDto,
      storeId,
      ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
    };

    try {
      return await this.prisma.product.update({
        where: { id },
        data: productData,
      });
    } catch (error) {
      console.error('Prisma Update Error:', error);
      throw error;
    }
  }
}
