import { Injectable } from '@nestjs/common';
import { CreateVendorStoreDto } from './dto/create-vendor-store.dto';
import { UpdateVendorStoreDto } from './dto/update-vendor-store.dto';

@Injectable()
export class VendorStoreService {
  create(createVendorStoreDto: CreateVendorStoreDto) {
    return 'This action adds a new vendorStore';
  }

  findAll() {
    return `This action returns all vendorStore`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vendorStore`;
  }

  update(id: number, updateVendorStoreDto: UpdateVendorStoreDto) {
    return `This action updates a #${id} vendorStore`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendorStore`;
  }
}
