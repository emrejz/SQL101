import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { EUserRole, IUser } from './../models/user.interface';
import { UserService } from './../services/user.service';
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { hasRoles } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

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
  @hasRoles(EUserRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
