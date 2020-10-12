import { catchError, switchMap, map } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
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
              const { password, ...result } = user;
              return result;
            }),
            catchError(err => of({ error: err.message })),
          );
        }),
        catchError(err => of({ error: err.message })),
      );
    } else {
      return of({
        error:
          'Username and password lengths must be between 3 and 10 characters!',
      });
    }
  }
  findOne(id: number): Observable<IUser | { error: string }> {
    return from(this.userRepository.findOne(id)).pipe(
      map(user => {
        const { password, ...result } = user;
        return result;
      }),
      catchError(err => of({ error: err.message })),
    );
  }
  findAll(): Observable<IUser[] | { error: string }> {
    return from(this.userRepository.find()).pipe(
      map((users: IUser[]) => {
        return users.map(item => {
          const { password, ...result } = item;
          return result;
        });
      }),
      catchError(err => of({ error: err.message })),
    );
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  updateOne(id: number, user: IUser): Observable<any> {
    return from(this.userRepository.update(id, user));
  }
}
