import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';

@Injectable()
export class RoomsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.cacheManager.set('rooms', {});
    this.cacheManager.set('users', {});
  }

  async getRooms(): Promise<string[]> {
    console.log('get rooms');
    return await this.cacheManager.get('rooms');
  }

  async joinRoom(
    socket: Socket,
    room_id: string,
    username: string,
  ): Promise<boolean> {
    try {
      socket.join(room_id);

      const all = (await this.cacheManager.get('rooms')) as any;

      const room = Object.keys(all).find((room: string) => room === room_id);

      if (!room) {
        all[room_id] = {};
        all[room_id][socket.id] = username;
      }

      await this.cacheManager.set('rooms', all);

      return true;
    } catch (error) {
      return false;
    }
  }

  async saveUser(socket: Socket, username: string): Promise<boolean> {
    try {
      const all = (await this.cacheManager.get('users')) as any;

      all[socket.id] = username;

      await this.cacheManager.set('users', all);

      return true;
    } catch (error) {
      return false;
    }
  }
}
