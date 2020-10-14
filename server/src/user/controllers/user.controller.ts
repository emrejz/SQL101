import { Pagination } from 'nestjs-typeorm-paginate';
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
  Query,
} from '@nestjs/common';
import { hasRoles } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserIdGuard } from 'src/auth/guards/userId.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @hasRoles(EUserRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('admin')
  deleteUserByAdmin(
    @Body() { id }: IUser,
  ): Observable<IUser | { error: string }> {
    return this.userService.deleteUser(id).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }

  @hasRoles(EUserRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('admin')
  updateUserByAdmin(
    @Body() user: IUser,
  ): Observable<IUser | { error: string }> {
    return this.userService.updateUser(user).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }

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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findUser(@Param('id') id: number): Observable<IUser | { error: string }> {
    return this.userService.findUser(id).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }

  @hasRoles(EUserRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Body('order') order: string,
  ): Observable<Pagination<IUser>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.paginate(
      {
        page,
        limit,

        route: 'http://localhost:3000/users',
      },
      order,
    );
  }

  @UseGuards(JwtAuthGuard, UserIdGuard)
  @Delete(':id')
  deleteUserByUser(
    @Param('id') id: number,
  ): Observable<IUser | { error: string }> {
    return this.userService.deleteUser(id).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }

  @UseGuards(JwtAuthGuard, UserIdGuard)
  @Put('username/:id')
  updateUsername(
    @Param('id') id: number,
    @Body() user: IUser,
  ): Observable<IUser | { error: string }> {
    return this.userService.updateUsername(id, user).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }

  @UseGuards(JwtAuthGuard, UserIdGuard)
  @Put('password/:id')
  updatePassword(
    @Param('id') id: number,
    @Body() user: IUser,
  ): Observable<IUser | { error: string }> {
    return this.userService.updatePassword(id, user).pipe(
      map(res => res),
      catchError(err => of({ error: err.message })),
    );
  }
}
