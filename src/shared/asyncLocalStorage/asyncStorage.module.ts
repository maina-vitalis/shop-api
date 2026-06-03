import { Module } from '@nestjs/common';
import { AsyncStorageService } from './asynStorage.service';

@Module({
  providers: [AsyncStorageService],
  exports: [AsyncStorageService],
})
export class AsyncStorageModule {}
