import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomsService } from './rooms.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway {
  constructor(private readonly roomsService: RoomsService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  async handleJoin(client: Socket, data: string): Promise<string[]> {
    const payload = JSON.parse(data);

    if (!(await this.roomsService.saveUser(client, payload.username))) {
      throw new Error('Error Registering User');
    }

    if (
      !(await this.roomsService.joinRoom(
        client,
        payload.room_id,
        payload.username,
      ))
    ) {
      throw new Error('Error Joining Room');
    }

    return await this.roomsService.getRooms();
  }
}
