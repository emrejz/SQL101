import { switchMap, map } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';
import { IUser } from './../models/user.interface';
import { UserEntity } from './../models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/services/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}
  create({ username, password }: IUser): Observable<IUser | { error: string }> {
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
            );
          }),
        );
      }
    }
    return of({
      error:
        'Username and password lengths must be between 3 and 10 characters!',
    });
  }
  findUser(id: number): Observable<IUser> {
    return from(this.userRepository.findOne(id)).pipe(
      map((user: IUser) => this.safeUserResponse(user)),
    );
  }
  findAllUser(): Observable<IUser[]> {
    return from(this.userRepository.find()).pipe(
      map((users: IUser[]) => {
        return users.map((user: IUser) => this.safeUserResponse(user));
      }),
    );
  }
  deleteUser(id: number): Observable<IUser | { error: string }> {
    return from(this.userRepository.delete(id)).pipe(
      map(res => {
        if (res.affected) {
          return { id };
        } else {
          return { error: 'Something went wrong!' };
        }
      }),
    );
  }

  updateUsername(
    id: number,
    { username }: IUser,
  ): Observable<IUser | { error: string }> {
    if (username) {
      username = username.trim();
      if (username.length > 3) {
        return from(this.userRepository.findOne({ username })).pipe(
          switchMap(result => {
            if (!result) {
              return from(
                this.userRepository.update(id, {
                  username,
                  updatedAt: new Date(),
                }),
              ).pipe(map(res => ({ id, username })));
            } else {
              return of({
                error: 'Username already exists. Please try another one!',
              });
            }
          }),
        );
      }
    }
    return of({
      error: 'Username length must be between 3 and 10 characters!',
    });
  }
  updatePassword(
    id: number,
    { password }: IUser,
  ): Observable<IUser | { error: string }> {
    if (password) {
      password = password.trim();
      if (password.length > 3) {
        return this.authService.hashPassword(password).pipe(
          switchMap((hashedPassword: string) =>
            from(
              this.userRepository.update(id, {
                password: hashedPassword,
                updatedAt: new Date(),
              }),
            ).pipe(
              map(res => {
                if (res.affected) {
                  return { id };
                } else {
                  return { error: 'Something went wrong!' };
                }
              }),
            ),
          ),
        );
      }
    }
    return of({
      error: 'Password must be at least 4 characters!',
    });
  }
  updateUser(user: IUser): Observable<IUser | { error: string }> {
    const { password, createdAt, ...data } = user;
    return from(this.userRepository.findOne({ username: data.username })).pipe(
      switchMap(result => {
        if (!result) {
          return from(
            this.userRepository.update(data.id, {
              ...data,
              updatedAt: new Date(),
            }),
          ).pipe(
            map(res => {
              if (res.affected) {
                return data;
              } else {
                return { error: 'Something went wrong!' };
              }
            }),
          );
        } else {
          return of({
            error: 'Username already exists. Please try another one!',
          });
        }
      }),
    );
  }
  login({ username, password }: IUser): Observable<string> {
    return from(this.userRepository.findOne({ username })).pipe(
      switchMap((user: IUser) => {
        if (user) {
          return this.authService
            .comparePasswords(password, user.password)
            .pipe(
              switchMap(isMatched => {
                if (isMatched) {
                  return this.authService
                    .generateToken(this.safeUserResponse(user))
                    .pipe(
                      map(token => {
                        return token;
                      }),
                    );
                } else {
                  throw new Error('Wrong password!');
                }
              }),
            );
        } else {
          throw new Error('User does not exist!');
        }
      }),
    );
  }
  paginate(
    options: IPaginationOptions,
    order: string,
  ): Observable<Pagination<IUser>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
      ])
      .orderBy(order);
    return from(paginate<IUser>(queryBuilder, options));
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
