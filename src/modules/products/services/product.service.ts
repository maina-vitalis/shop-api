import { CloudinaryService } from '../../../shared/cloudinary/cloudinary.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/product.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

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
      const newProduct = await this.prisma.product.create({
        data: productData,
      });

      return newProduct;
    } catch (error) {
      // Handle Prisma errors (e.g., unique constraint on SKU)
      console.error('Prisma Create Error:', error);
      throw error;
    }
  }

  async getProducts() {}
  async getProduct() {}
  async deleteProduct() {}
}
