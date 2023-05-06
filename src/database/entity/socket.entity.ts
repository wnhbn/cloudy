import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('socket')
export class Socket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  socketId: string;

  @Column({ unique: true })
  userId: number;
}
