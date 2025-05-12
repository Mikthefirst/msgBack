import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 80 })
  group_nickname: string;

  isGroup: boolean;

  @Column({ nullable: true, length: 100 })
  groupName?: string;

  @Column({ nullable: true })
  groupAvatar?: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  CreatedAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  UpdatedAt: Date;
}




/*
export interface Conversation {
  id: string;
  group_nickname: string;
  participants: User[];
  lastMessage_ID?: message_id;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}
*/
