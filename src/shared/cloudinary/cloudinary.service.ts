import { Inject, Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  uploadFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder: '/eshop/products',
        },
        (error, result) => {
          if (error) {
            console.log(error, 'multer cloudinary');
            return reject(new Error(error.message));
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}
