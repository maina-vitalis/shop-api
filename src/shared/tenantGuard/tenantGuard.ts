import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AsyncStorageService } from '../asyncLocalStorage/asynStorage.service';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { AuthenticatedUser } from '../../types/authenticatedUser.type';

@Injectable()
export class StoreGuardContext implements CanActivate {
  constructor(private readonly storeStorage: AsyncStorageService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user = request.user as AuthenticatedUser;

    // 1. Extract the active tenant identifier sent by the frontend configuration
    const storeId = request.headers['x-store-id'] as string;

    if (!storeId) {
      throw new ForbiddenException('A store id is required in the headers');
    }

    //verify ownership
    const hasAccess = user.vendorProfile?.store.some(
      (store) => store.id === storeId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have administrative access to this store.',
      );
    }

    let canProceed = false;

    console.log(this.storeStorage);

    this.storeStorage.run(storeId, () => (canProceed = true));

    return canProceed;
  }
}
