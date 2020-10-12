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
    return this.userService.create(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<IUser> {
    return this.userService.findOne(id);
  }
  @Get()
  findAll(): Observable<IUser[]> {
    return this.userService.findAll();
  }
  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.userService.deleteOne(id);
  }
  @Put(':id')
  updateOne(@Param('id') id: number, @Body() user: IUser): Observable<any> {
    return this.userService.updateOne(id, user);
  }
}
