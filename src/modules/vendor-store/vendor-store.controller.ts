import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VendorStoreService } from './vendor-store.service';
import { CreateVendorStoreDto } from './dto/create-vendor-store.dto';
import { UpdateVendorStoreDto } from './dto/update-vendor-store.dto';

@Controller('vendor-store')
export class VendorStoreController {
  constructor(private readonly vendorStoreService: VendorStoreService) {}

  @Post()
  create(@Body() createVendorStoreDto: CreateVendorStoreDto) {
    return this.vendorStoreService.create(createVendorStoreDto);
  }

  @Get()
  findAll() {
    return this.vendorStoreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorStoreService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVendorStoreDto: UpdateVendorStoreDto,
  ) {
    return this.vendorStoreService.update(+id, updateVendorStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorStoreService.remove(+id);
  }
}
