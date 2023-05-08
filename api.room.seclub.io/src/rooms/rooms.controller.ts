import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import Room from './dto/room.dto';

@Controller({
  path: 'rooms',
  version: '1',
})
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getRooms(): Promise<string[]> {
    return await this.roomsService.getRooms();
  }

  @Get('/:id')
  async getRoom(id: string): Promise<Room[]> {
    return await this.roomsService.getRoom(id);
  }
}
