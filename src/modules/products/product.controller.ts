import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/product.dto';
import { ProductService } from './product.service';
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Headers,
  Param,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth';
import { StoreGuardContext } from '../../shared/tenantGuard/tenantGuard';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //create product
  @Post()
  @ApiOperation({ summary: 'Create new Product' })
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  createProduct(
    @Body()
    createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productService.createProduct(createProductDto, files);
  }

  //Get products for the current store
  @Get()
  @UseGuards(JwtAuthGuard, StoreGuardContext)
  getProducts(@Headers('x-store-id') storeId: string) {
    return this.productService.getProducts(storeId);
  }

  //getting all the products
  @Get('all')
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  //GetProduct by id
  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  //Delete product by id
  @Post('delete/:id')
  @UseGuards(JwtAuthGuard, StoreGuardContext)
  deleteProductById(@Param('id') id: string) {
    return this.productService.deleteProductById(id);
  }

  //Update product by id
  @Post('update/:id')
  @UseGuards(JwtAuthGuard, StoreGuardContext)
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  updateProductById(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productService.updateProductById(id, updateProductDto, files);
  }
}
