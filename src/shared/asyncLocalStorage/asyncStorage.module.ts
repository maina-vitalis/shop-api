import { Global, Module } from '@nestjs/common';
import { AsyncStorageService } from './asynStorage.service';

@Global()
@Module({
  providers: [AsyncStorageService],
  exports: [AsyncStorageService],
})
export class AsyncStorageModule {}
