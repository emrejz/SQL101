import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { IUser } from './../models/user.interface';
import { UserService } from './../services/user.service';
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: IUser): Observable<IUser | { error: string }> {
    return this.userService.create(user).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }
  @Post('login')
  login(
    @Body() user: IUser,
  ): Observable<{ token: string } | { error: string }> {
    return this.userService.login(user).pipe(
      map(token => ({ token })),
      catchError(err => of({ error: err.message })),
    );
  }
  @Get(':id')
  findOne(@Param('id') id: number): Observable<IUser | { error: string }> {
    return this.userService.findOne(id).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }
  @Get()
  findAll(): Observable<IUser[] | { error: string }> {
    return this.userService.findAll().pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }
  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<IUser | { error: string }> {
    return this.userService.deleteOne(id).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }
  @Put(':id')
  updateOne(
    @Param('id') id: number,
    @Body() user: IUser,
  ): Observable<IUser | { error: string }> {
    return this.userService.updateOne(id, user).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }
}
