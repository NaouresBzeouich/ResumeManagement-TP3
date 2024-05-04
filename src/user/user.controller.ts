import {Controller, Get, Post, Body, Patch, Param, Delete, Sse, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {UserSubscribeDto} from "./dto/create-UserSubscribeDto";
import {LoginCreadentialsDto} from "./dto/create-LoginCreadentialsDto";
import {filter, fromEvent, map, Observable} from "rxjs";
import {EventEmitter2} from "@nestjs/event-emitter";
import {CV_EVENTS} from "../cv/cv.events.config";
import { merge } from 'rxjs';
import {AuthGuardGuard} from "./auth-guard/auth-guard.guard";
import {GetUser} from "./user.decorator";
import {User, UserRoleEnum} from "./entities/user.entity";
import {Cv} from "../cv/entities/cv.entity";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
              private eventEmitter: EventEmitter2
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('/subscribe')
  subscribe(@Body() userSubscribeDto: UserSubscribeDto) {
    return this.userService.subscribe(userSubscribeDto);
  }

  @Post('/login')
  login(@Body() credentials: LoginCreadentialsDto)  {
    return this.userService.login(credentials);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('usernames')
  async findAllAsUser() {
    const users = await  this.userService.findAll();
    const usernames = users.map(user => user.username);
    return usernames;
  }
  @Get('/listen')
  @UseGuards(AuthGuardGuard)
  @Sse('sse')
  sse(
  ): Observable<MessageEvent> {
    if(true){
      console.log("I'm admin");

      const addStream = fromEvent(this.eventEmitter, CV_EVENTS.add).pipe(
          map(( payload ) => new MessageEvent('new-cv', { data: payload })),
      );

      const deleteStream = fromEvent(this.eventEmitter, CV_EVENTS.delete).pipe(
          map((payload) => new MessageEvent('cv-deleted', { data: payload })),
      );

      const updateStream = fromEvent(this.eventEmitter, CV_EVENTS.update).pipe(
          map((payload ) => new MessageEvent('cv-updated', { data: payload })),
      );
      return merge(addStream, deleteStream, updateStream);
    }
    else{
    const addStream = fromEvent(this.eventEmitter, CV_EVENTS.add).pipe(
        map(( payload ) => new MessageEvent('new-cv', { data: payload })),
    );

    return merge(addStream);
  }
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
