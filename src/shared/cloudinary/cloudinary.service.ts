import { Inject, Injectable } from '@nestjs/common';
import { v2, UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder: 'eshop/products', // Removed leading slash
          resource_type: 'auto', // Automatically detects if it's an image or PDF
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new Error(error.message));
          }

          if (!result) {
            return reject(new Error('Cloudinary upload returned no result.'));
          }

          resolve(result);
        },
      );

      // Pipes the binary buffer directly to Cloudinary
      Readable.from(file.buffer).pipe(upload);
    });
  }
}
