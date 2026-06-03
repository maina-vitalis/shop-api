import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class AsyncStorageService {
  private static readonly storage = new AsyncLocalStorage<
    Map<string, string>
  >();

  //Wraps an execution path (callback) inside a persistent asynchronous context.
  run(storeId: string, callback: () => void): void {
    const store = new Map<string, string>();
    store.set('storeId', storeId);
    AsyncStorageService.storage.run(store, callback);
  }

  //Retrieves the storeId bound to the current asynchronous execution thread.
  getStoreId() {
    const store = AsyncStorageService.storage.getStore();
    return store?.get('storeId');
  }
}
