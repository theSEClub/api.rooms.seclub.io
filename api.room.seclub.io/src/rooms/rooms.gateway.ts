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
        this.server,
        client,
        payload.room_id,
        payload.username,
      ))
    ) {
      throw new Error('Error Joining Room');
    }

    return await this.roomsService.getRooms();
  }

  @SubscribeMessage('relayICECandidate')
  async handleRelayICECandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): Promise<void> {
    const payload = JSON.parse(data);

    const peer_id = payload.peer_id;
    const ice_candidate = payload.ice_candidate;

    await this.server.to(peer_id).emit('iceCandidate', {
      peer_id: client.id,
      ice_candidate: ice_candidate,
    });
  }
}
