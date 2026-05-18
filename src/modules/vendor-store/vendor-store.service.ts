import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorStoreDto } from './dto/create-vendor-store.dto';
import { UpdateVendorStoreDto } from './dto/update-vendor-store.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorStoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new store for a vendor

  async create(userId: string, createVendorStoreDto: CreateVendorStoreDto) {
    // Verify that the vendor profile exists
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      throw new NotFoundException('Vendor profile not found');
    }

    return await this.prisma.store.create({
      data: {
        ...createVendorStoreDto,
        vendorProfileId: vendorProfile.id,
      },
      include: {
        products: true,
      },
    });
  }

  /**
   * Get all stores that belong to a vendor (by userId)
   */
  async findAllByVendor(userId: string) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        store: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!vendorProfile) {
      throw new NotFoundException('Vendor profile not found for this user');
    }

    return vendorProfile.store;
  }

  /**
   * Get a single store by ID
   */
  async findOne(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        products: true,
        vendorProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    return store;
  }

  /**
   * Update a store
   */
  async update(storeId: string, updateVendorStoreDto: UpdateVendorStoreDto) {
    // Verify store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    return await this.prisma.store.update({
      where: { id: storeId },
      data: updateVendorStoreDto,
      include: {
        products: true,
        vendorProfile: true,
      },
    });
  }

  /**
   * Delete a store
   */
  async remove(storeId: string) {
    // Verify store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    return await this.prisma.store.delete({
      where: { id: storeId },
    });
  }

  /**
   * Get all stores (admin/system use)
   */
  async findAll() {
    return await this.prisma.store.findMany({
      include: {
        products: true,
        vendorProfile: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Verify a store (admin use)
   */
  async verifyStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    return await this.prisma.store.update({
      where: { id: storeId },
      data: {
        isVerified: true,
      },
    });
  }
}
