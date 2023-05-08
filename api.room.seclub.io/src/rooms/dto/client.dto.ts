import Room from './room.dto';

export default class Client {
  public id: string;
  public username: string;
  public room: Room;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }

  public setRoom(room: Room): void {
    this.room = room;
  }

  public getRoom(): Room {
    return this.room;
  }
}
