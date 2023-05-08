import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Socket, Server } from 'socket.io';
import Client from './dto/client.dto';
import Room from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.cacheManager.set('rooms', [], 0);
    this.cacheManager.set('users', [], 0);
  }

  async getRooms(): Promise<string[]> {
    return await this.cacheManager.get('rooms');
  }

  async joinRoom(
    server: Server,
    client: Socket,
    room_id: string,
    username: string,
  ): Promise<boolean> {
    try {
      client.join(room_id);

      const rooms = (await this.cacheManager.get('rooms')) as Room[];

      let room = rooms.find((room) => room.id === room_id);

      if (!room) {
        room = new Room(room_id);
        rooms.push(room);
      }

      room.clients.forEach((user) => {
        server.to(user.id).emit('addPeer', {
          username: username,
          peer_id: client.id,
          should_create_offer: false,
        });

        client.emit('addPeer', {
          username: user.username,
          peer_id: user,
          should_create_offer: true,
        });
      });

      const user = new Client(client.id, username);
      user.setRoom(new Room(room_id));
      room.addClient(user);

      await this.cacheManager.set('rooms', rooms, 0);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async saveUser(client: Socket, username: string): Promise<boolean> {
    try {
      const all = (await this.cacheManager.get('users')) as Client[];

      const user = new Client(client.id, username);

      all[client.id] = user;

      await this.cacheManager.set('users', all, 0);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getClientRoom(client: Socket): Promise<Room> {
    const users = (await this.cacheManager.get('users')) as Client[];

    const user = users.find((room) => room.id === client.id);

    return user.getRoom();
  }
}
