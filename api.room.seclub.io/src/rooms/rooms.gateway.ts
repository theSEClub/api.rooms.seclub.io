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
  async handleJoin(client: Socket, data: string): Promise<void> {
    console.log('[join] ' + client.id);

    if (!(await this.roomsService.saveUser(client, data['username']))) {
      throw new Error('Error Registering User');
    }

    if (
      !(await this.roomsService.joinRoom(
        this.server,
        client,
        data['room_id'],
        data['username'],
      ))
    ) {
      throw new Error('Error Joining Room');
    }
  }

  @SubscribeMessage('relayICECandidate')
  async handleRelayICECandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): Promise<void> {
    // const payload = JSON.parse(data);

    const peer_id = data['peer_id'];
    const ice_candidate = ['ice_candidate'];

    await this.server.to(peer_id).emit('iceCandidate', {
      peer_id: client.id,
      ice_candidate: ice_candidate,
    });
  }

  @SubscribeMessage('relaySessionDescription')
  async handleRelaySessionDescription(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): Promise<void> {
    // const payload = JSON.parse(data);

    const peer_id = data['peer_id'];
    const session_description = data['session_description'];

    await this.server.to(peer_id).emit('sessionDescription', {
      peer_id: client.id,
      session_description: session_description,
    });
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    await this.roomsService.removeUserFromRooms(client, this.server);
  }
}
