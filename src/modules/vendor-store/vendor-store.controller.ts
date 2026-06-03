import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VendorStoreService } from './vendor-store.service';
import { CreateVendorStoreDto } from './dto/create-vendor-store.dto';
import { UpdateVendorStoreDto } from './dto/update-vendor-store.dto';
import { CurrentUser, JwtAuthGuard } from '../auth';
import { type User } from '../../generated/prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StoreGuardContext } from '../../shared/tenantGuard/tenantGuard';

@ApiBearerAuth()
@ApiTags('vendor-store')
@UseGuards(JwtAuthGuard, StoreGuardContext)
@Controller('vendor-store')
export class VendorStoreController {
  constructor(private readonly vendorStoreService: VendorStoreService) {}

  @Post()
  create(
    @Body() createVendorStoreDto: CreateVendorStoreDto,
    @CurrentUser() user: User,
  ) {
    return this.vendorStoreService.create(user.id, createVendorStoreDto);
  }

  //get all stores that belong to the vendor
  @ApiOperation({
    summary: 'get all the stores that belong to the logged in user',
  })
  @ApiResponse({ status: 200, description: 'All stores retrieved' })
  @Get()
  findAllByVendor(@CurrentUser() user: User) {
    console.log(user);
    return this.vendorStoreService.findAllByVendor(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorStoreService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVendorStoreDto: UpdateVendorStoreDto,
  ) {
    return this.vendorStoreService.update(id, updateVendorStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorStoreService.remove(id);
  }
}
