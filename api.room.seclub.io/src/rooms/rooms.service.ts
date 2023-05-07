import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';

@Injectable()
export class RoomsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.cacheManager.set('rooms', {}, 0);
    this.cacheManager.set('users', {}, 0);
  }

  async getRooms(): Promise<string[]> {
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
      }

      for (const user in all[room_id]) {
        socket.to(user).emit('addPeer', {
          username: username,
          peer_id: socket.id,
          should_create_offer: false,
        });

        socket.emit('addPeer', {
          username: all[room_id][user],
          peer_id: user,
          should_create_offer: true,
        });
      }

      all[room_id][socket.id] = username;

      await this.cacheManager.set('rooms', all, 0);

      return true;
    } catch (error) {
      return false;
    }
  }

  async saveUser(socket: Socket, username: string): Promise<boolean> {
    try {
      const all = (await this.cacheManager.get('users')) as { id: string }[];

      all[socket.id] = username;

      await this.cacheManager.set('users', all, 0);

      return true;
    } catch (error) {
      return false;
    }
  }
}
