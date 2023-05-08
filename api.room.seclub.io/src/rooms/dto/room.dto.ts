import Client from './client.dto';

export default class Room {
  public id: string;
  public clients: Client[];

  constructor(id: string) {
    this.id = id;
    this.clients = [];
  }

  public addClient(client: Client): void {
    this.clients.push(client);
  }
}
