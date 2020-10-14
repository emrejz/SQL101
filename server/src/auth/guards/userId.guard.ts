import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/user/models/user.interface';

@Injectable()
export class UserIdGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: IUser = request.user;
    return user && user.id === Number(request.params.id);
  }
}
