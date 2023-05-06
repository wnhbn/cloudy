import { User } from './user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('conversation')
export class Conversation {
  @Column({ name: 'id', type: 'string' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'nvarchar', nullable: false })
  title: string;

  @Column({ name: 'image', nullable: false })
  image: string;

  @ManyToOne(() => User, (creator) => creator.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creatorId: User;

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  CreatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  DeletedAt?: Date;
}
