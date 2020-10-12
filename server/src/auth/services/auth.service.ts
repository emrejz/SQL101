import { IUser } from './../../user/models/user.interface';
import { from, Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
const bcryptjs = require('bcryptjs');

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: IUser): Observable<string> {
    return from(this.jwtService.sign(user));
  }
  hashPassword(password: string): Observable<string> {
    return from<string>(bcryptjs.hash(password, 10));
  }
  comparePasswords(newPassword: string, passwortHash: string): Observable<any> {
    return from(bcryptjs.compare(newPassword, passwortHash));
  }
}
