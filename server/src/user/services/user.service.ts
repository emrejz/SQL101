import { catchError, switchMap, map } from 'rxjs/operators';
import { Observable, throwError, from, of } from 'rxjs';
import { IUser } from './../models/user.interface';
import { UserEntity } from './../models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}
  create(user: IUser): Observable<IUser | { error: string }> {
    const { username, password } = user;
    if (username && username.length > 3 && password && password.length > 3) {
      return this.authService.hashPassword(password).pipe(
        switchMap((hashedPass: string) => {
          const newUser = new UserEntity();
          newUser.username = username;
          newUser.password = hashedPass;
          return from(this.userRepository.save(newUser)).pipe(
            map((user: IUser) => {
              console.log(user);
              const { password, ...result } = user;
              return result;
            }),
            catchError(err => of({ error: err.message })),
          );
        }),
        catchError(err => throwError(err.message)),
      );
    } else {
      return throwError(
        'Username and password lengths must be between 3 and 10 characters!',
      );
    }
  }
  findOne(id: number): Observable<IUser> {
    return from(this.userRepository.findOne(id));
  }
  findAll(): Observable<IUser[]> {
    return from(this.userRepository.find());
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  updateOne(id: number, user: IUser): Observable<any> {
    return from(this.userRepository.update(id, user));
  }
}
