import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  //create product
  async createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    // 1. Initialize an empty array for URLs
    let imageUrls: {
      url: string;
      alt: string;
      isPrimary: boolean;
    }[] = [];

    // 2. Upload images only if they exist
    if (files && files.length > 0) {
      // We map directly to the upload call.
      // Since uploadFile returns the Cloudinary object, we extract .secure_url
      const uploadPromises = files.map(async (file, index) => {
        const result = await this.cloudinary.uploadFile(file);
        return {
          url: result.secure_url,
          alt: file.originalname,
          isPrimary: index === 0,
        };
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // 3. Construct the final object for Prisma
    // We merge the DTO data with the newly generated image URL strings
    const productData = {
      ...createProductDto,
      images: imageUrls, // This now matches your Prisma string[] type
    };

    // 4. Save to Database
    try {
      return await this.prisma.product.create({
        data: productData,
      });
    } catch (error) {
      // Handle Prisma errors (e.g., unique constraint on SKU)
      console.error('Prisma Create Error:', error);
      throw error;
    }
  }

  //get products for the current store
  async getProducts(storeId: string) {
    if (!storeId) {
      throw new Error('Store ID is required to fetch products.');
    }
    return this.prisma.product.findMany({
      where: {
        storeId: storeId,
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

  async deleteProductById(id: string) {
    return this.prisma.product.delete({
      where: {
        id: id,
      },
    });
  }

  //update product by id
  async updateProductById(
    id: string,
    updateProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    // Similar logic to createProduct for handling images
    let imageUrls: {
      url: string;
      alt: string;
      isPrimary: boolean;
    }[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file, index) => {
        const result = await this.cloudinary.uploadFile(file);
        return {
          url: result.secure_url,
          alt: file.originalname,
          isPrimary: index === 0,
        };
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    const productData = {
      ...updateProductDto,
      images: imageUrls.length > 0 ? imageUrls : undefined, // Only update images if new ones are provided
    };

    try {
      return await this.prisma.product.update({
        where: {
          id: id,
        },
        data: productData,
      });
    } catch (error) {
      console.error('Prisma Update Error:', error);
      throw error;
    }
  }
}
