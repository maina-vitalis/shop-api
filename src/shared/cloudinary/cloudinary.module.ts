import { Module } from '@nestjs/common';
import { CloudinaryProvider } from 'src/shared/cloudinary/cloudinaryProvider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
