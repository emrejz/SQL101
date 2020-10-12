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
    let { username, password } = user;
    if (username && password) {
      username = username.trim();
      password = password.trim();
      if (username.length > 3 && password.length > 3) {
        return this.authService.hashPassword(password).pipe(
          switchMap((hashedPass: string) => {
            const newUser = new UserEntity();
            newUser.username = username;
            newUser.password = hashedPass;
            return from(this.userRepository.save(newUser)).pipe(
              map((user: IUser) => this.safeUserResponse(user)),
              catchError(err => of({ error: err.message })),
            );
          }),
          catchError(err => of({ error: err.message })),
        );
      }
    }
    return of({
      error:
        'Username and password lengths must be between 3 and 10 characters!',
    });
  }
  findOne(id: number): Observable<IUser | { error: string }> {
    return from(this.userRepository.findOne(id)).pipe(
      map((user: IUser) => this.safeUserResponse(user)),
      catchError(err => of({ error: err.message })),
    );
  }
  findAll(): Observable<IUser[] | { error: string }> {
    return from(this.userRepository.find()).pipe(
      map((users: IUser[]) => {
        return users.map((user: IUser) => this.safeUserResponse(user));
      }),
      catchError(err => of({ error: err.message })),
    );
  }
  deleteOne(id: number): Observable<IUser | { error: string }> {
    return from(this.findOne(id)).pipe(
      switchMap((user: IUser) => {
        return from(this.userRepository.delete(id)).pipe(
          map(res => user),
          catchError(err => of({ error: err.message })),
        );
      }),
    );
  }
  updateOne(id: number, user: IUser): Observable<IUser | { error: string }> {
    let { username } = user;
    if (username) {
      username = username.trim();
      if (username.length > 3) {
        return from(this.userRepository.findOne({ where: { username } })).pipe(
          switchMap(result => {
            if (!result) {
              return from(
                this.userRepository.update(id, {
                  username,
                  updatedAt: new Date(),
                }),
              ).pipe(
                map(res => user),
                catchError(err => of({ error: err.message })),
              );
            } else {
              return of({
                error: 'Username already exists. Please try another one!',
              });
            }
          }),
          catchError(err => of({ error: err.message })),
        );
      }
    }
    return of({
      error: 'Username length must be between 3 and 10 characters!',
    });
  }
  safeUserResponse(user: IUser) {
    if (user) {
      const { password, ...result } = user;
      return result;
    } else {
      throw new Error('User does not exist!');
    }
  }
}
