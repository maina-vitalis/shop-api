import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AsyncStorageService } from '../asyncLocalStorage/asynStorage.service';
import { Observable } from 'rxjs';
import { Request } from 'express';

export class StoreGuardContext implements CanActivate {
  constructor(private readonly storeStorage: AsyncStorageService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = request.user as any;

    // 1. Extract the active tenant identifier sent by the frontend configuration
    const storeId = request.headers['x-store-id'] as string;

    if (!storeId) {
      throw new ForbiddenException('A store id is required in the headers');
    }

    //verify ownership

    console.log(user?.vendorProfile, 'user in the store guard context');

    // if (!hasAccess) {
    //   throw new ForbiddenException(
    //     'You do not have administrative access to this store.',
    //   );
    // }

    let canProceed = false;
    this.storeStorage.run(storeId, () => {
      canProceed = true;
    });

    return canProceed;
  }
}
